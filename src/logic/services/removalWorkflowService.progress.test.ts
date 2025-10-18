import { FeatureFlagService } from '../../featureFlags';
import { removalWorkflowService } from './removalWorkflowService';
import {
	groupRepository,
	removalQueueRepository,
} from '@database/repositories';
import { sleep } from '@logic/helpers';

// Mock the FeatureFlagService
jest.mock('../../featureFlags', () => ({
	FeatureFlag: {
		QUEUE_REMOVAL: 'QUEUE_REMOVAL',
		BLACKLIST_ENFORCEMENT: 'BLACKLIST_ENFORCEMENT',
		BLACKLIST_AUTO_REMOVAL: 'BLACKLIST_AUTO_REMOVAL',
	},
	FeatureFlagService: {
		isEnabled: jest.fn(),
	},
}));

// Mock all dependencies
jest.mock('@database/repositories');
jest.mock('@logic/helpers');
jest.mock('./removalQueueService');

const mockFeatureFlagService = FeatureFlagService as jest.Mocked<
	typeof FeatureFlagService
>;

describe('RemovalWorkflowService - Progress Reporting', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFeatureFlagService.isEnabled.mockReturnValue(true);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('runRemovalInBatches - progress reporting', () => {
		it('should report progress at start of batch processing', async () => {
			const onProgress = jest.fn();
			const mockGroupRepository = groupRepository as jest.Mocked<
				typeof groupRepository
			>;
			const mockRemovalQueueRepository = removalQueueRepository as jest.Mocked<
				typeof removalQueueRepository
			>;

			mockGroupRepository.getByWaId.mockResolvedValue({
				id: 'group-123',
				whatsappId: 'test-group',
				name: 'Test Group',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			});
			mockRemovalQueueRepository.getNextBatch.mockResolvedValue([]);

			await removalWorkflowService.runRemovalInBatches({
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 100,
				dryRun: true,
				onProgress,
			});

			// Should report initial progress
			expect(onProgress).toHaveBeenCalledWith({
				processed: 0,
				message: 'Starting batch removal',
			});
		});

		it('should report progress after each batch is processed', async () => {
			const onProgress = jest.fn();
			const mockGroupRepository = groupRepository as jest.Mocked<
				typeof groupRepository
			>;
			const mockRemovalQueueRepository = removalQueueRepository as jest.Mocked<
				typeof removalQueueRepository
			>;
			const mockSleep = sleep as jest.MockedFunction<typeof sleep>;

			mockGroupRepository.getByWaId.mockResolvedValue({
				id: 'group-123',
				whatsappId: 'test-group',
				name: 'Test Group',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			});

			// Return 2 batches, then empty
			mockRemovalQueueRepository.getNextBatch
				.mockResolvedValueOnce([
					{
						id: 'queue-1',
						userId: 'user-1',
						groupId: 'group-123',
						createdAt: new Date(),
						user: {
							id: 'user-1',
							whatsappId: '1234567890',
							whatsappPn: null,
							name: null,
							createdAt: new Date(),
						},
						group: {
							id: 'group-123',
							whatsappId: 'test-group',
							name: 'Test Group',
							inactivityThresholdMinutes: 43200,
							createdAt: new Date(),
						},
					},
					{
						id: 'queue-2',
						userId: 'user-2',
						groupId: 'group-123',
						createdAt: new Date(),
						user: {
							id: 'user-2',
							whatsappId: '1234567891',
							whatsappPn: null,
							name: null,
							createdAt: new Date(),
						},
						group: {
							id: 'group-123',
							whatsappId: 'test-group',
							name: 'Test Group',
							inactivityThresholdMinutes: 43200,
							createdAt: new Date(),
						},
					},
				])
				.mockResolvedValueOnce([
					{
						id: 'queue-3',
						userId: 'user-3',
						groupId: 'group-123',
						createdAt: new Date(),
						user: {
							id: 'user-3',
							whatsappId: '1234567892',
							whatsappPn: null,
							name: null,
							createdAt: new Date(),
						},
						group: {
							id: 'group-123',
							whatsappId: 'test-group',
							name: 'Test Group',
							inactivityThresholdMinutes: 43200,
							createdAt: new Date(),
						},
					},
				])
				.mockResolvedValueOnce([]);

			mockSleep.mockResolvedValue(undefined);

			await removalWorkflowService.runRemovalInBatches({
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 100,
				dryRun: true,
				onProgress,
			});

			// Should report progress for each batch
			expect(onProgress).toHaveBeenCalledTimes(3);
			expect(onProgress).toHaveBeenNthCalledWith(1, {
				processed: 0,
				message: 'Starting batch removal',
			});
			expect(onProgress).toHaveBeenNthCalledWith(2, {
				processed: 2,
				message: 'Processed batch: success',
			});
			expect(onProgress).toHaveBeenNthCalledWith(3, {
				processed: 3,
				message: 'Processed batch: success',
			});
		});

		it('should report progress on cancellation', async () => {
			const onProgress = jest.fn();
			const mockGroupRepository = groupRepository as jest.Mocked<
				typeof groupRepository
			>;
			const abortController = new AbortController();

			mockGroupRepository.getByWaId.mockResolvedValue({
				id: 'group-123',
				whatsappId: 'test-group',
				name: 'Test Group',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			});

			// Abort immediately
			abortController.abort();

			await removalWorkflowService.runRemovalInBatches({
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 100,
				dryRun: true,
				signal: abortController.signal,
				onProgress,
			});

			// Should report initial progress and cancellation
			expect(onProgress).toHaveBeenCalledWith({
				processed: 0,
				message: 'Starting batch removal',
			});
			expect(onProgress).toHaveBeenCalledWith({
				processed: 0,
				message: 'Job cancelled',
			});
		});

		it('should accumulate processed count across batches', async () => {
			const onProgress = jest.fn();
			const mockGroupRepository = groupRepository as jest.Mocked<
				typeof groupRepository
			>;
			const mockRemovalQueueRepository = removalQueueRepository as jest.Mocked<
				typeof removalQueueRepository
			>;
			const mockSleep = sleep as jest.MockedFunction<typeof sleep>;

			mockGroupRepository.getByWaId.mockResolvedValue({
				id: 'group-123',
				whatsappId: 'test-group',
				name: 'Test Group',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			});

			const createMockQueueItem = (id: string, whatsappId: string) => ({
				id,
				userId: `user-${id}`,
				groupId: 'g1',
				createdAt: new Date(),
				user: {
					id: `user-${id}`,
					whatsappId,
					whatsappPn: null,
					name: null,
					createdAt: new Date(),
				},
				group: {
					id: 'g1',
					whatsappId: 'test-group',
					name: 'Test Group',
					inactivityThresholdMinutes: 43200,
					createdAt: new Date(),
				},
			});

			// Return 3 batches of different sizes
			mockRemovalQueueRepository.getNextBatch
				.mockResolvedValueOnce([
					createMockQueueItem('1', 'u1'),
					createMockQueueItem('2', 'u2'),
					createMockQueueItem('3', 'u3'),
				])
				.mockResolvedValueOnce([
					createMockQueueItem('4', 'u4'),
					createMockQueueItem('5', 'u5'),
				])
				.mockResolvedValueOnce([createMockQueueItem('6', 'u6')])
				.mockResolvedValueOnce([]);

			mockSleep.mockResolvedValue(undefined);

			await removalWorkflowService.runRemovalInBatches({
				groupWaId: 'test-group',
				batchSize: 5,
				delayMs: 100,
				dryRun: true,
				onProgress,
			});

			// Verify accumulated counts
			expect(onProgress).toHaveBeenCalledWith({
				processed: 3,
				message: 'Processed batch: success',
			});
			expect(onProgress).toHaveBeenCalledWith({
				processed: 5,
				message: 'Processed batch: success',
			});
			expect(onProgress).toHaveBeenCalledWith({
				processed: 6,
				message: 'Processed batch: success',
			});
		});
	});

	describe('runWorkflow - progress reporting', () => {
		it('should report progress during workflow phases', async () => {
			const onProgress = jest.fn();
			const mockSyncRemovalQueue = jest.spyOn(
				removalWorkflowService,
				'syncRemovalQueue'
			);
			const mockRunRemovalInBatches = jest.spyOn(
				removalWorkflowService,
				'runRemovalInBatches'
			);

			mockSyncRemovalQueue.mockResolvedValue([]);
			mockRunRemovalInBatches.mockResolvedValue([]);

			await removalWorkflowService.runWorkflow({
				batchSize: 10,
				delayMs: 10000,
				groupWaId: 'test-group',
				dryRun: true,
				inactivityWindowMs: 2592000000,
				onProgress,
			});

			// Should report progress at workflow start and after sync
			expect(onProgress).toHaveBeenCalledWith({
				processed: 0,
				message: 'Starting workflow: sync phase',
			});
			expect(onProgress).toHaveBeenCalledWith({
				processed: 0,
				message: 'Sync phase complete, starting removal phase',
			});

			// Should pass onProgress to runRemovalInBatches
			expect(mockRunRemovalInBatches).toHaveBeenCalledWith(
				expect.objectContaining({
					onProgress,
				})
			);
		});

		it('should report progress on cancellation during sync phase', async () => {
			const onProgress = jest.fn();
			const abortController = new AbortController();

			// Abort before sync
			abortController.abort();

			await removalWorkflowService.runWorkflow({
				batchSize: 10,
				delayMs: 10000,
				groupWaId: 'test-group',
				dryRun: true,
				inactivityWindowMs: 2592000000,
				signal: abortController.signal,
				onProgress,
			});

			expect(onProgress).toHaveBeenCalledWith({
				processed: 0,
				message: 'Starting workflow: sync phase',
			});
			expect(onProgress).toHaveBeenCalledWith({
				processed: 0,
				message: 'Cancelled before sync phase',
			});
		});

		it('should report progress on cancellation after sync phase', async () => {
			const onProgress = jest.fn();
			const abortController = new AbortController();
			const mockSyncRemovalQueue = jest.spyOn(
				removalWorkflowService,
				'syncRemovalQueue'
			);

			mockSyncRemovalQueue.mockImplementation(async () => {
				// Abort after sync completes
				abortController.abort();
				return [];
			});

			await removalWorkflowService.runWorkflow({
				batchSize: 10,
				delayMs: 10000,
				groupWaId: 'test-group',
				dryRun: true,
				inactivityWindowMs: 2592000000,
				signal: abortController.signal,
				onProgress,
			});

			expect(onProgress).toHaveBeenCalledWith({
				processed: 0,
				message: 'Starting workflow: sync phase',
			});
			expect(onProgress).toHaveBeenCalledWith({
				processed: 0,
				message: 'Sync phase complete, starting removal phase',
			});
			expect(onProgress).toHaveBeenCalledWith({
				processed: 0,
				message: 'Cancelled after sync phase',
			});
		});
	});
});
