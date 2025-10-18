/**
 * JobManager - In-memory job tracking system for long-running workflows
 *
 * Limitations:
 * - Single-process only (jobs lost on restart)
 * - Not distributed (use Redis for multi-instance deployments)
 */

export enum JobStatus {
	PENDING = 'pending',
	RUNNING = 'running',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled',
	FAILED = 'failed',
}

export enum JobType {
	REMOVAL_WORKFLOW = 'removal_workflow',
	REMOVAL_QUEUE = 'removal_queue',
}

export interface JobConfig {
	groupWaId: string;
	batchSize: number;
	delayMs: number;
	dryRun: boolean;
	inactivityWindowMs?: number;
}

export interface Job {
	id: string;
	type: JobType;
	status: JobStatus;
	config: JobConfig;
	progress: {
		processed: number;
		total?: number;
		currentBatch?: number;
	};
	result?: {
		removedWhatsappIds?: string[];
		error?: string;
	};
	createdAt: Date;
	startedAt?: Date;
	completedAt?: Date;
	abortController: AbortController;
}

export class JobManager {
	private jobs: Map<string, Job> = new Map();
	private readonly JOB_TTL_MS = 3600000; // 1 hour
	private cleanupInterval?: NodeJS.Timeout;

	constructor() {
		// Start cleanup interval
		this.startCleanup();
	}

	/**
	 * Create a new job and return its ID
	 */
	createJob(type: JobType, config: JobConfig): Job {
		const id = this.generateJobId();
		const job: Job = {
			id,
			type,
			status: JobStatus.PENDING,
			config,
			progress: {
				processed: 0,
			},
			createdAt: new Date(),
			abortController: new AbortController(),
		};

		this.jobs.set(id, job);
		return job;
	}

	/**
	 * Get a job by ID
	 */
	getJob(id: string): Job | undefined {
		return this.jobs.get(id);
	}

	/**
	 * Get all jobs (optionally filtered by status)
	 */
	getAllJobs(status?: JobStatus): Job[] {
		const allJobs = Array.from(this.jobs.values());
		if (status) {
			return allJobs.filter((job) => job.status === status);
		}
		return allJobs;
	}

	/**
	 * Update job status
	 */
	updateJobStatus(id: string, status: JobStatus): void {
		const job = this.jobs.get(id);
		if (!job) {return;}

		job.status = status;

		if (status === JobStatus.RUNNING && !job.startedAt) {
			job.startedAt = new Date();
		}

		if (
			[JobStatus.COMPLETED, JobStatus.CANCELLED, JobStatus.FAILED].includes(
				status
			)
		) {
			job.completedAt = new Date();
		}
	}

	/**
	 * Update job progress
	 */
	updateJobProgress(id: string, progress: Partial<Job['progress']>): void {
		const job = this.jobs.get(id);
		if (!job) {return;}

		job.progress = { ...job.progress, ...progress };
	}

	/**
	 * Set job result
	 */
	setJobResult(id: string, result: Job['result']): void {
		const job = this.jobs.get(id);
		if (!job) {return;}

		job.result = result;
	}

	/**
	 * Cancel a running job
	 */
	cancelJob(id: string): boolean {
		const job = this.jobs.get(id);
		if (!job) {return false;}

		// Only cancel if job is pending or running
		if (job.status !== JobStatus.PENDING && job.status !== JobStatus.RUNNING) {
			return false;
		}

		job.abortController.abort();
		this.updateJobStatus(id, JobStatus.CANCELLED);
		return true;
	}

	/**
	 * Delete a job
	 */
	deleteJob(id: string): boolean {
		return this.jobs.delete(id);
	}

	/**
	 * Generate a unique job ID
	 */
	private generateJobId(): string {
		return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Start cleanup interval to remove old finished jobs
	 */
	private startCleanup(): void {
		// Run cleanup every 10 minutes
		this.cleanupInterval = setInterval(() => {
			this.cleanupFinishedJobs();
		}, 600000);
	}

	/**
	 * Clean up finished jobs older than TTL
	 */
	private cleanupFinishedJobs(): void {
		const now = Date.now();
		const finishedStatuses = [
			JobStatus.COMPLETED,
			JobStatus.CANCELLED,
			JobStatus.FAILED,
		];

		for (const [id, job] of this.jobs.entries()) {
			if (
				finishedStatuses.includes(job.status) &&
				job.completedAt &&
				now - job.completedAt.getTime() > this.JOB_TTL_MS
			) {
				this.jobs.delete(id);
				console.log(`Cleaned up finished job: ${id}`);
			}
		}
	}

	/**
	 * Stop cleanup interval (for testing/shutdown)
	 */
	stopCleanup(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = undefined;
		}
	}

	/**
	 * Clear all jobs (for testing)
	 */
	clearAllJobs(): void {
		this.jobs.clear();
	}
}

// Singleton instance
export const jobManager = new JobManager();
