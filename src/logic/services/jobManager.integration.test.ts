import { jobManager, JobStatus, JobType } from '@logic/services/jobManager';

describe('JobManager - Integration Tests', () => {
	beforeEach(() => {
		// Create a fresh instance for each test
		jobManager.clearAllJobs();
	});

	afterAll(() => {
		// Clean up the singleton's cleanup interval
		jobManager.stopCleanup();
	});

	describe('End-to-End Job Lifecycle', () => {
		it('should handle complete job lifecycle: create -> run -> complete', async () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			// Create job
			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			expect(job.status).toBe(JobStatus.PENDING);
			expect(job.id).toBeDefined();

			// Start job
			jobManager.updateJobStatus(job.id, JobStatus.RUNNING);
			expect(jobManager.getJob(job.id)?.status).toBe(JobStatus.RUNNING);
			expect(jobManager.getJob(job.id)?.startedAt).toBeInstanceOf(Date);

			// Update progress
			jobManager.updateJobProgress(job.id, {
				processed: 10,
				total: 50,
				currentBatch: 2,
			});
			const updatedJob = jobManager.getJob(job.id);
			expect(updatedJob?.progress.processed).toBe(10);
			expect(updatedJob?.progress.total).toBe(50);

			// Complete job
			jobManager.updateJobStatus(job.id, JobStatus.COMPLETED);
			jobManager.setJobResult(job.id, {
				removedWhatsappIds: ['user1', 'user2', 'user3'],
			});

			const completedJob = jobManager.getJob(job.id);
			expect(completedJob?.status).toBe(JobStatus.COMPLETED);
			expect(completedJob?.completedAt).toBeInstanceOf(Date);
			expect(completedJob?.result?.removedWhatsappIds).toHaveLength(3);

			console.log('✅ End-to-end job lifecycle test passed');
		});

		it('should handle job cancellation during execution', async () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			// Create and start job
			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			jobManager.updateJobStatus(job.id, JobStatus.RUNNING);

			// Simulate some progress
			jobManager.updateJobProgress(job.id, { processed: 5 });

			// Cancel job
			const cancelled = jobManager.cancelJob(job.id);
			expect(cancelled).toBe(true);

			// Verify cancellation
			const cancelledJob = jobManager.getJob(job.id);
			expect(cancelledJob?.status).toBe(JobStatus.CANCELLED);
			expect(cancelledJob?.abortController.signal.aborted).toBe(true);
			expect(cancelledJob?.completedAt).toBeInstanceOf(Date);

			console.log('✅ Job cancellation test passed');
		});

		it('should handle multiple concurrent jobs', () => {
			const config1 = {
				groupWaId: 'group-1',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};
			const config2 = {
				groupWaId: 'group-2',
				batchSize: 10,
				delayMs: 15000,
				dryRun: false,
			};

			// Create multiple jobs
			const job1 = jobManager.createJob(JobType.REMOVAL_QUEUE, config1);
			const job2 = jobManager.createJob(JobType.REMOVAL_WORKFLOW, {
				...config2,
				inactivityWindowMs: 2592000000,
			});

			// Start both jobs
			jobManager.updateJobStatus(job1.id, JobStatus.RUNNING);
			jobManager.updateJobStatus(job2.id, JobStatus.RUNNING);

			// Verify both are running
			const runningJobs = jobManager.getAllJobs(JobStatus.RUNNING);
			expect(runningJobs).toHaveLength(2);

			// Complete first, cancel second
			jobManager.updateJobStatus(job1.id, JobStatus.COMPLETED);
			jobManager.cancelJob(job2.id);

			// Verify states
			expect(jobManager.getJob(job1.id)?.status).toBe(JobStatus.COMPLETED);
			expect(jobManager.getJob(job2.id)?.status).toBe(JobStatus.CANCELLED);

			console.log('✅ Multiple concurrent jobs test passed');
		});

		it('should filter jobs by status correctly', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			// Create jobs with different statuses
			const job1 = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			const job2 = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			const job3 = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			const job4 = jobManager.createJob(JobType.REMOVAL_QUEUE, config);

			jobManager.updateJobStatus(job1.id, JobStatus.RUNNING);
			jobManager.updateJobStatus(job2.id, JobStatus.RUNNING);
			jobManager.updateJobStatus(job3.id, JobStatus.COMPLETED);
			jobManager.updateJobStatus(job4.id, JobStatus.FAILED);

			// Test filters
			expect(jobManager.getAllJobs(JobStatus.PENDING)).toHaveLength(0);
			expect(jobManager.getAllJobs(JobStatus.RUNNING)).toHaveLength(2);
			expect(jobManager.getAllJobs(JobStatus.COMPLETED)).toHaveLength(1);
			expect(jobManager.getAllJobs(JobStatus.FAILED)).toHaveLength(1);
			expect(jobManager.getAllJobs()).toHaveLength(4);

			console.log('✅ Job filtering test passed');
		});

		it('should preserve job data after updates', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			const originalId = job.id;
			const originalCreatedAt = job.createdAt;

			// Update multiple times
			jobManager.updateJobStatus(job.id, JobStatus.RUNNING);
			jobManager.updateJobProgress(job.id, { processed: 10 });
			jobManager.updateJobProgress(job.id, { total: 100 });
			jobManager.updateJobProgress(job.id, { currentBatch: 2 });

			// Verify original data preserved
			const updatedJob = jobManager.getJob(job.id);
			expect(updatedJob?.id).toBe(originalId);
			expect(updatedJob?.createdAt).toEqual(originalCreatedAt);
			expect(updatedJob?.config).toEqual(config);

			// Verify updates applied
			expect(updatedJob?.progress.processed).toBe(10);
			expect(updatedJob?.progress.total).toBe(100);
			expect(updatedJob?.progress.currentBatch).toBe(2);

			console.log('✅ Job data preservation test passed');
		});

		it('should handle job failure with error message', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			jobManager.updateJobStatus(job.id, JobStatus.RUNNING);

			// Simulate failure
			jobManager.updateJobStatus(job.id, JobStatus.FAILED);
			jobManager.setJobResult(job.id, {
				error: 'Database connection failed',
			});

			const failedJob = jobManager.getJob(job.id);
			expect(failedJob?.status).toBe(JobStatus.FAILED);
			expect(failedJob?.result?.error).toBe('Database connection failed');
			expect(failedJob?.completedAt).toBeInstanceOf(Date);

			console.log('✅ Job failure handling test passed');
		});

		it('should not allow cancelling completed jobs', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			jobManager.updateJobStatus(job.id, JobStatus.RUNNING);
			jobManager.updateJobStatus(job.id, JobStatus.COMPLETED);

			const cancelled = jobManager.cancelJob(job.id);
			expect(cancelled).toBe(false);
			expect(jobManager.getJob(job.id)?.status).toBe(JobStatus.COMPLETED);

			console.log('✅ Completed job cancellation prevention test passed');
		});

		it('should handle rapid status changes', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);

			// Rapid status changes
			jobManager.updateJobStatus(job.id, JobStatus.RUNNING);
			jobManager.updateJobStatus(job.id, JobStatus.COMPLETED);

			const finalJob = jobManager.getJob(job.id);
			expect(finalJob?.status).toBe(JobStatus.COMPLETED);
			expect(finalJob?.startedAt).toBeInstanceOf(Date);
			expect(finalJob?.completedAt).toBeInstanceOf(Date);

			console.log('✅ Rapid status changes test passed');
		});
	});
});
