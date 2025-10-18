# Cancellable Job System Documentation

## Overview

The cancellable job system provides a way to manage long-running removal workflows in a controlled manner. Jobs can be started, monitored, and cancelled via HTTP endpoints.

## Architecture

### Components

1. **JobManager** (`src/logic/services/jobManager.ts`)
   - In-memory job tracking using a Map
   - Job lifecycle management (create, update, cancel, delete)
   - Automatic cleanup of finished jobs (TTL: 1 hour)
   - Singleton pattern for global access

2. **Job Controller** (`src/routes/jobController.ts`)
   - HTTP endpoints for job management
   - Background job execution
   - Error handling and status reporting

3. **Modified Services**
   - `removalWorkflowService.ts`: Added support for AbortSignal
   - Checks cancellation signal at key points during execution

## Job Types

### `removal_workflow`
Runs the full workflow: sync inactive members + remove in batches

**Required Config:**
- `groupWaId`: WhatsApp group ID
- `batchSize`: Number of users per batch (e.g., 5)
- `delayMs`: Delay between batches in milliseconds (min: 10000)
- `dryRun`: Boolean - true for testing, false for actual removal
- `inactivityWindowMs`: Time window in milliseconds for inactivity detection

### `removal_queue`
Runs only the removal phase (processes existing queue)

**Required Config:**
- `groupWaId`: WhatsApp group ID
- `batchSize`: Number of users per batch
- `delayMs`: Delay between batches in milliseconds (min: 10000)
- `dryRun`: Boolean - true for testing, false for actual removal

## Job Status

- **`pending`**: Job created but not started
- **`running`**: Job is currently executing
- **`completed`**: Job finished successfully
- **`cancelled`**: Job was cancelled by user
- **`failed`**: Job encountered an error

## API Endpoints

### Start a Job

```http
POST /admin/jobs/start
Content-Type: application/json

{
  "type": "removal_workflow",
  "groupWaId": "120363403645737238@g.us",
  "batchSize": 5,
  "delayMs": 10000,
  "dryRun": true,
  "inactivityWindowMs": 2592000000
}
```

**Response (202 Accepted):**
```json
{
  "jobId": "job_1234567890_abc123",
  "message": "Job started successfully",
  "status": "pending"
}
```

### Get Job Status

```http
GET /admin/jobs/:jobId/status
```

**Response (200 OK):**
```json
{
  "id": "job_1234567890_abc123",
  "type": "removal_workflow",
  "status": "running",
  "config": {
    "groupWaId": "120363403645737238@g.us",
    "batchSize": 5,
    "delayMs": 10000,
    "dryRun": true,
    "inactivityWindowMs": 2592000000
  },
  "progress": {
    "processed": 50,
    "total": 100,
    "currentBatch": 10
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "startedAt": "2024-01-15T10:30:01.000Z"
}
```

### Cancel a Job

```http
POST /admin/jobs/:jobId/cancel
```

**Response (200 OK):**
```json
{
  "jobId": "job_1234567890_abc123",
  "message": "Job cancelled successfully",
  "status": "cancelled"
}
```

### List All Jobs

```http
GET /admin/jobs
GET /admin/jobs?status=running
```

**Response (200 OK):**
```json
[
  {
    "id": "job_1234567890_abc123",
    "type": "removal_workflow",
    "status": "running",
    "config": { ... },
    "progress": { ... },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "startedAt": "2024-01-15T10:30:01.000Z"
  },
  {
    "id": "job_9876543210_xyz789",
    "type": "removal_queue",
    "status": "completed",
    "config": { ... },
    "progress": { ... },
    "result": {
      "removedWhatsappIds": ["123@lid", "456@lid"]
    },
    "createdAt": "2024-01-15T09:00:00.000Z",
    "startedAt": "2024-01-15T09:00:01.000Z",
    "completedAt": "2024-01-15T09:30:00.000Z"
  }
]
```

## Usage Examples

### Example 1: Dry Run Workflow

```bash
# Start a dry run workflow
curl -X POST http://localhost:3000/admin/jobs/start \
  -H "Content-Type: application/json" \
  -d '{
    "type": "removal_workflow",
    "groupWaId": "120363403645737238@g.us",
    "batchSize": 5,
    "delayMs": 10000,
    "dryRun": true,
    "inactivityWindowMs": 2592000000
  }'

# Get job ID from response
# {"jobId":"job_1234567890_abc123",...}

# Monitor status
curl http://localhost:3000/admin/jobs/job_1234567890_abc123/status

# Cancel if needed
curl -X POST http://localhost:3000/admin/jobs/job_1234567890_abc123/cancel
```

### Example 2: Production Queue Processing

```bash
# Start production removal (dryRun: false)
curl -X POST http://localhost:3000/admin/jobs/start \
  -H "Content-Type: application/json" \
  -d '{
    "type": "removal_queue",
    "groupWaId": "120363403645737238@g.us",
    "batchSize": 5,
    "delayMs": 10000,
    "dryRun": false
  }'

# List running jobs
curl http://localhost:3000/admin/jobs?status=running

# Get specific job status
curl http://localhost:3000/admin/jobs/job_1234567890_abc123/status
```

## Cancellation Behavior

### When a Job is Cancelled:
1. The AbortSignal is triggered via `abortController.abort()`
2. Job status is immediately set to `cancelled`
3. The running workflow checks the signal at key points:
   - Before sync phase
   - After sync phase (before removal)
   - At the start of each batch
4. When signal is detected, the workflow exits gracefully
5. Already processed batches remain committed to database
6. Partial results are saved in job.result

### Graceful Cancellation:
- No mid-batch interruption (batch completes before checking signal)
- Database operations are atomic per batch
- No inconsistent state (users either fully removed or not at all)
- Cancellation is detected within ~10 seconds (delay between batches)

## Limitations

### Single-Process Only
- Jobs are stored in-memory (Map)
- Process restart loses all job state
- Not suitable for distributed/multi-instance deployments

### No Persistence
- Job history is lost on restart
- Only recent finished jobs are kept (1 hour TTL)
- For production, consider:
  - Redis for distributed job storage
  - Database for persistent job history
  - Message queue (Bull, BullMQ) for robust job processing

### Rate Limits
- Minimum 10 second delay between batches enforced
- Large groups (1000+ users) can take 1+ hours
- Consider WhatsApp rate limits when setting batch size

## Future Enhancements

Potential improvements for production use:

1. **Distributed Storage**
   - Use Redis for job state
   - Enable multi-instance deployments
   - Persist job history to database

2. **Enhanced Monitoring**
   - WebSocket for real-time progress updates
   - Job progress percentage calculation
   - Estimated time remaining

3. **Job Scheduling**
   - Cron-like scheduling for recurring workflows
   - Delayed job execution
   - Job priority queue

4. **Advanced Features**
   - Job retry on failure
   - Job chaining (workflow steps)
   - Pause/resume functionality
   - Job timeout configuration

## Testing

### Unit Tests
```bash
npm test -- jobManager.test.ts
npm test -- jobController.test.ts
```

### Integration Testing
1. Start a dry run job
2. Monitor its progress
3. Cancel mid-execution
4. Verify graceful shutdown
5. Check job result shows partial completion

## Error Handling

Jobs handle errors at multiple levels:

1. **Validation Errors** (HTTP 400)
   - Missing required fields
   - Invalid field values
   - Invalid job type

2. **Not Found Errors** (HTTP 404)
   - Job ID doesn't exist
   - Group not found

3. **Runtime Errors**
   - Job status set to `failed`
   - Error message stored in `job.result.error`
   - Logged to console

## Monitoring

### Console Logs
- Job creation: "Job started successfully"
- Cancellation: "Job cancelled during batch processing"
- Completion: "Job {jobId} completed successfully"
- Cleanup: "Cleaned up finished job: {jobId}"

### Status Checking
```bash
# Check all running jobs
curl http://localhost:3000/admin/jobs?status=running

# Check failed jobs
curl http://localhost:3000/admin/jobs?status=failed
```

## Security Considerations

1. **Authentication**: Add authentication middleware to `/admin/jobs/*` endpoints
2. **Rate Limiting**: Add rate limiting to prevent job spam
3. **Authorization**: Implement role-based access control
4. **Input Validation**: All inputs are validated before job creation
5. **Resource Limits**: Consider max concurrent jobs limit

## Performance

### Memory Usage
- Each job: ~1KB (config + metadata)
- 1000 active jobs: ~1MB
- Automatic cleanup after 1 hour
- Recommended max: 10,000 jobs in memory

### Job Execution
- Batch processing: O(n/batchSize) where n = queue size
- Database queries: O(batchSize) per batch
- Memory per batch: O(batchSize)
- Total time: (queue_size / batchSize) * (delayMs / 1000) seconds

Example: 1000 users, batch size 5, 10s delay = ~33 minutes
