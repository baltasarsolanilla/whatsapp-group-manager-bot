import { jobManager, JobStatus, JobType } from './jobManager';

describe('JobManager', () => {
	beforeEach(() => {
		jobManager.clearAllJobs();
	});

	afterAll(() => {
		jobManager.stopCleanup();
		jobManager.clearAllJobs();
	});

	describe('createJob', () => {
		it('should create a new job with pending status', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);

			expect(job.id).toBeDefined();
			expect(job.type).toBe(JobType.REMOVAL_QUEUE);
			expect(job.status).toBe(JobStatus.PENDING);
			expect(job.config).toEqual(config);
			expect(job.progress.processed).toBe(0);
			expect(job.createdAt).toBeInstanceOf(Date);
			expect(job.abortController).toBeInstanceOf(AbortController);
		});

		it('should generate unique job IDs', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job1 = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			const job2 = jobManager.createJob(JobType.REMOVAL_QUEUE, config);

			expect(job1.id).not.toBe(job2.id);
		});
	});

	describe('getJob', () => {
		it('should retrieve a job by ID', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			const retrieved = jobManager.getJob(job.id);

			expect(retrieved).toBeDefined();
			expect(retrieved?.id).toBe(job.id);
		});

		it('should return undefined for non-existent job', () => {
			const retrieved = jobManager.getJob('non-existent-id');
			expect(retrieved).toBeUndefined();
		});
	});

	describe('getAllJobs', () => {
		it('should return all jobs', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			jobManager.createJob(JobType.REMOVAL_WORKFLOW, config);

			const allJobs = jobManager.getAllJobs();
			expect(allJobs).toHaveLength(2);
		});

		it('should filter jobs by status', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job1 = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			const job2 = jobManager.createJob(JobType.REMOVAL_WORKFLOW, config);

			jobManager.updateJobStatus(job1.id, JobStatus.RUNNING);
			jobManager.updateJobStatus(job2.id, JobStatus.COMPLETED);

			const runningJobs = jobManager.getAllJobs(JobStatus.RUNNING);
			expect(runningJobs).toHaveLength(1);
			expect(runningJobs[0].id).toBe(job1.id);
		});
	});

	describe('updateJobStatus', () => {
		it('should update job status to running and set startedAt', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			jobManager.updateJobStatus(job.id, JobStatus.RUNNING);

			const updated = jobManager.getJob(job.id);
			expect(updated?.status).toBe(JobStatus.RUNNING);
			expect(updated?.startedAt).toBeInstanceOf(Date);
		});

		it('should update job status to completed and set completedAt', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			jobManager.updateJobStatus(job.id, JobStatus.COMPLETED);

			const updated = jobManager.getJob(job.id);
			expect(updated?.status).toBe(JobStatus.COMPLETED);
			expect(updated?.completedAt).toBeInstanceOf(Date);
		});

		it('should handle non-existent job gracefully', () => {
			expect(() => {
				jobManager.updateJobStatus('non-existent-id', JobStatus.RUNNING);
			}).not.toThrow();
		});
	});

	describe('updateJobProgress', () => {
		it('should update job progress', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			jobManager.updateJobProgress(job.id, {
				processed: 10,
				total: 100,
				currentBatch: 2,
			});

			const updated = jobManager.getJob(job.id);
			expect(updated?.progress.processed).toBe(10);
			expect(updated?.progress.total).toBe(100);
			expect(updated?.progress.currentBatch).toBe(2);
		});

		it('should merge progress updates', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			jobManager.updateJobProgress(job.id, { total: 100 });
			jobManager.updateJobProgress(job.id, { processed: 10 });

			const updated = jobManager.getJob(job.id);
			expect(updated?.progress.processed).toBe(10);
			expect(updated?.progress.total).toBe(100);
		});
	});

	describe('setJobResult', () => {
		it('should set job result', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			jobManager.setJobResult(job.id, {
				removedWhatsappIds: ['123', '456'],
			});

			const updated = jobManager.getJob(job.id);
			expect(updated?.result?.removedWhatsappIds).toEqual(['123', '456']);
		});

		it('should set error in result', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			jobManager.setJobResult(job.id, { error: 'Something went wrong' });

			const updated = jobManager.getJob(job.id);
			expect(updated?.result?.error).toBe('Something went wrong');
		});
	});

	describe('cancelJob', () => {
		it('should cancel a pending job', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			const cancelled = jobManager.cancelJob(job.id);

			expect(cancelled).toBe(true);
			const updated = jobManager.getJob(job.id);
			expect(updated?.status).toBe(JobStatus.CANCELLED);
			expect(updated?.abortController.signal.aborted).toBe(true);
		});

		it('should cancel a running job', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			jobManager.updateJobStatus(job.id, JobStatus.RUNNING);
			const cancelled = jobManager.cancelJob(job.id);

			expect(cancelled).toBe(true);
			const updated = jobManager.getJob(job.id);
			expect(updated?.status).toBe(JobStatus.CANCELLED);
		});

		it('should not cancel a completed job', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			jobManager.updateJobStatus(job.id, JobStatus.COMPLETED);
			const cancelled = jobManager.cancelJob(job.id);

			expect(cancelled).toBe(false);
			const updated = jobManager.getJob(job.id);
			expect(updated?.status).toBe(JobStatus.COMPLETED);
		});

		it('should return false for non-existent job', () => {
			const cancelled = jobManager.cancelJob('non-existent-id');
			expect(cancelled).toBe(false);
		});
	});

	describe('deleteJob', () => {
		it('should delete a job', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			const deleted = jobManager.deleteJob(job.id);

			expect(deleted).toBe(true);
			expect(jobManager.getJob(job.id)).toBeUndefined();
		});

		it('should return false for non-existent job', () => {
			const deleted = jobManager.deleteJob('non-existent-id');
			expect(deleted).toBe(false);
		});
	});

	describe('cleanup', () => {
		it('should not cleanup recent finished jobs', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			jobManager.updateJobStatus(job.id, JobStatus.COMPLETED);

			// Manually trigger cleanup
			jobManager.cleanupFinishedJobs();

			expect(jobManager.getJob(job.id)).toBeDefined();
		});

		it('should cleanup old finished jobs', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			jobManager.updateJobStatus(job.id, JobStatus.COMPLETED);

			// Manually set completedAt to old time
			const oldJob = jobManager.getJob(job.id);
			if (oldJob?.completedAt) {
				oldJob.completedAt = new Date(Date.now() - 3700000); // 1 hour and 10 minutes ago
			}

			// Manually trigger cleanup
			jobManager.cleanupFinishedJobs();

			expect(jobManager.getJob(job.id)).toBeUndefined();
		});

		it('should not cleanup running jobs', () => {
			const config = {
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 10000,
				dryRun: true,
			};

			const job = jobManager.createJob(JobType.REMOVAL_QUEUE, config);
			jobManager.updateJobStatus(job.id, JobStatus.RUNNING);

			// Manually trigger cleanup
			jobManager.cleanupFinishedJobs();

			expect(jobManager.getJob(job.id)).toBeDefined();
		});
	});
});
