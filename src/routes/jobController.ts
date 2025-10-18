import { removalWorkflowService } from '@logic/services/removalWorkflowService';
import {
	jobManager,
	JobStatus,
	JobType,
	JobConfig,
} from '@logic/services/jobManager';
import { AppError } from '@utils/AppError';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess, resAccepted } from '@utils/resSuccess';
import { Request, Response } from 'express';

export const jobController = {
	/**
	 * POST /admin/jobs/start
	 * Start a new removal job (workflow or queue)
	 */
	start: catchAsync(async (req: Request, res: Response) => {
		const { type, groupWaId, batchSize, delayMs, dryRun, inactivityWindowMs } =
			req.body ?? {};

		// Validate required fields
		if (!type) {
			throw AppError.required(
				'type is required (removal_workflow or removal_queue)'
			);
		}

		if (!Object.values(JobType).includes(type)) {
			throw AppError.badRequest(
				`Invalid job type. Must be one of: ${Object.values(JobType).join(', ')}`
			);
		}

		if (!groupWaId) {
			throw AppError.required('groupWaId is required');
		}

		if (!batchSize || typeof batchSize !== 'number') {
			throw AppError.required('batchSize must be a number');
		}

		if (!delayMs || typeof delayMs !== 'number') {
			throw AppError.required('delayMs must be a number');
		}

		if (delayMs < 10000) {
			throw AppError.badRequest(
				'delayMs must be at least 10 seconds (10000ms) to avoid WhatsApp rate limits'
			);
		}

		if (dryRun === undefined) {
			throw AppError.required('dryRun is required (true or false)');
		}

		// Validate type-specific fields
		if (type === JobType.REMOVAL_WORKFLOW) {
			if (!inactivityWindowMs || typeof inactivityWindowMs !== 'number') {
				throw AppError.required(
					'inactivityWindowMs must be a number for removal_workflow'
				);
			}

			if (inactivityWindowMs <= 0) {
				throw AppError.badRequest(
					'inactivityWindowMs must be a positive number'
				);
			}
		}

		// Create job config
		const config: JobConfig = {
			groupWaId,
			batchSize,
			delayMs,
			dryRun,
			...(type === JobType.REMOVAL_WORKFLOW && { inactivityWindowMs }),
		};

		// Create job
		const job = jobManager.createJob(type, config);

		// Start job execution in background
		executeJob(job.id, type, config).catch((error) => {
			console.error(`Job ${job.id} failed:`, error);
			jobManager.updateJobStatus(job.id, JobStatus.FAILED);
			jobManager.setJobResult(job.id, {
				error: error instanceof Error ? error.message : 'Unknown error',
			});
		});

		resAccepted(res, {
			jobId: job.id,
			message: 'Job started successfully',
			status: job.status,
		});
	}),

	/**
	 * GET /admin/jobs/:jobId/status
	 * Get status and progress of a job
	 */
	status: catchAsync(async (req: Request, res: Response) => {
		const { jobId } = req.params;

		if (!jobId) {
			throw AppError.required('jobId is required');
		}

		const job = jobManager.getJob(jobId);

		if (!job) {
			throw AppError.notFound(`Job not found: ${jobId}`);
		}

		// Return job status without the AbortController
		const jobData = {
			id: job.id,
			type: job.type,
			status: job.status,
			config: job.config,
			progress: job.progress,
			result: job.result,
			createdAt: job.createdAt,
			startedAt: job.startedAt,
			completedAt: job.completedAt,
		};

		resSuccess(res, jobData);
	}),

	/**
	 * POST /admin/jobs/:jobId/cancel
	 * Cancel a running job
	 */
	cancel: catchAsync(async (req: Request, res: Response) => {
		const { jobId } = req.params;

		if (!jobId) {
			throw AppError.required('jobId is required');
		}

		const job = jobManager.getJob(jobId);

		if (!job) {
			throw AppError.notFound(`Job not found: ${jobId}`);
		}

		const cancelled = jobManager.cancelJob(jobId);

		if (!cancelled) {
			throw AppError.badRequest(
				`Job cannot be cancelled (current status: ${job.status})`
			);
		}

		resSuccess(res, {
			jobId,
			message: 'Job cancelled successfully',
			status: JobStatus.CANCELLED,
		});
	}),

	/**
	 * GET /admin/jobs
	 * List all jobs (optionally filtered by status)
	 */
	list: catchAsync(async (req: Request, res: Response) => {
		const status = req.query.status as JobStatus | undefined;

		if (status && !Object.values(JobStatus).includes(status)) {
			throw AppError.badRequest(
				`Invalid status. Must be one of: ${Object.values(JobStatus).join(', ')}`
			);
		}

		const jobs = jobManager.getAllJobs(status);

		// Remove AbortController from response by mapping to plain objects
		const jobsData = jobs.map((job) => ({
			id: job.id,
			type: job.type,
			status: job.status,
			config: job.config,
			progress: job.progress,
			result: job.result,
			createdAt: job.createdAt,
			startedAt: job.startedAt,
			completedAt: job.completedAt,
		}));

		resSuccess(res, jobsData);
	}),
};

/**
 * Execute a job in the background
 */
async function executeJob(
	jobId: string,
	type: JobType,
	config: JobConfig
): Promise<void> {
	const job = jobManager.getJob(jobId);
	if (!job) {
		throw new Error(`Job not found: ${jobId}`);
	}

	// Update status to running
	jobManager.updateJobStatus(jobId, JobStatus.RUNNING);

	try {
		let removedWhatsappIds: string[] = [];

		if (type === JobType.REMOVAL_WORKFLOW) {
			// Run full workflow (sync + removal)
			removedWhatsappIds = await removalWorkflowService.runWorkflow({
				...config,
				inactivityWindowMs: config.inactivityWindowMs!,
				signal: job.abortController.signal,
			});
		} else if (type === JobType.REMOVAL_QUEUE) {
			// Run queue removal only
			removedWhatsappIds = await removalWorkflowService.runRemovalInBatches({
				...config,
				signal: job.abortController.signal,
			});
		}

		// Check if job was cancelled during execution
		if (job.abortController.signal.aborted) {
			console.log(`Job ${jobId} was cancelled`);
			// Status already set to CANCELLED by cancelJob
			jobManager.setJobResult(jobId, { removedWhatsappIds });
		} else {
			// Job completed successfully
			jobManager.updateJobStatus(jobId, JobStatus.COMPLETED);
			jobManager.setJobResult(jobId, { removedWhatsappIds });
			console.log(`Job ${jobId} completed successfully`);
		}
	} catch (error) {
		console.error(`Job ${jobId} failed:`, error);
		jobManager.updateJobStatus(jobId, JobStatus.FAILED);
		jobManager.setJobResult(jobId, {
			error: error instanceof Error ? error.message : 'Unknown error',
		});
		throw error;
	}
}
