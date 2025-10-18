import { FeatureFlag, FeatureFlagService } from '../../featureFlags';
import { removalWorkflowService } from './removalWorkflowService';

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

describe('RemovalWorkflowService - Feature Flag Integration', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('runWorkflow', () => {
		it('should skip workflow execution when QUEUE_REMOVAL flag is disabled', async () => {
			mockFeatureFlagService.isEnabled.mockReturnValue(false);

			const result = await removalWorkflowService.runWorkflow({
				batchSize: 10,
				delayMs: 1000,
				groupWaId: 'test-group',
				dryRun: true,
				inactivityWindowMs: 2592000000,
			});

			expect(mockFeatureFlagService.isEnabled).toHaveBeenCalledWith(
				FeatureFlag.QUEUE_REMOVAL
			);
			expect(result).toEqual([]);
		});

		it('should proceed with workflow execution when QUEUE_REMOVAL flag is enabled', async () => {
			mockFeatureFlagService.isEnabled.mockReturnValue(true);

			// Mock the dependencies to prevent actual execution
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
				delayMs: 1000,
				groupWaId: 'test-group',
				dryRun: true,
				inactivityWindowMs: 2592000000,
			});

			expect(mockFeatureFlagService.isEnabled).toHaveBeenCalledWith(
				FeatureFlag.QUEUE_REMOVAL
			);
			expect(mockSyncRemovalQueue).toHaveBeenCalledWith(
				'test-group',
				2592000000
			);
			expect(mockRunRemovalInBatches).toHaveBeenCalledWith({
				groupWaId: 'test-group',
				batchSize: 10,
				delayMs: 1000,
				dryRun: true,
			});
		});
	});

	describe('runRemovalInBatches', () => {
		it('should skip batch execution when QUEUE_REMOVAL flag is disabled', async () => {
			mockFeatureFlagService.isEnabled.mockReturnValue(false);

			const result = await removalWorkflowService.runRemovalInBatches({
				groupWaId: 'test-group',
				batchSize: 10,
				delayMs: 1000,
				dryRun: true,
			});

			expect(mockFeatureFlagService.isEnabled).toHaveBeenCalledWith(
				FeatureFlag.QUEUE_REMOVAL
			);
			expect(result).toEqual([]);
		});

		it('should skip database operations when dryRun is true', async () => {
			// Import repositories after they are mocked
			const {
				groupRepository,
				removalQueueRepository,
				removalHistoryRepository,
				groupMembershipRepository,
			} = await import('@database/repositories');

			const mockGroupRepository = groupRepository as jest.Mocked<
				typeof groupRepository
			>;
			const mockRemovalQueueRepository = removalQueueRepository as jest.Mocked<
				typeof removalQueueRepository
			>;
			const mockRemovalHistoryRepository =
				removalHistoryRepository as jest.Mocked<
					typeof removalHistoryRepository
				>;
			const mockGroupMembershipRepository =
				groupMembershipRepository as jest.Mocked<
					typeof groupMembershipRepository
				>;

			mockFeatureFlagService.isEnabled.mockReturnValue(true);

			// Mock group lookup
			mockGroupRepository.getByWaId = jest
				.fn()
				.mockResolvedValue({ id: 'group-id-1' });

			// Mock queue items
			mockRemovalQueueRepository.getNextBatch = jest
				.fn()
				.mockResolvedValueOnce([
					{
						id: 'queue-1',
						user: { id: 'user-1', whatsappId: '1234567890' },
						group: { id: 'group-id-1' },
					},
					{
						id: 'queue-2',
						user: { id: 'user-2', whatsappId: '0987654321' },
						group: { id: 'group-id-1' },
					},
				])
				.mockResolvedValueOnce([]); // Second call returns empty to end loop

			// Mock repository operations
			mockRemovalQueueRepository.remove = jest.fn();
			mockRemovalHistoryRepository.add = jest.fn();
			mockGroupMembershipRepository.removeByUserAndGroup = jest.fn();

			const { sleep } = await import('@logic/helpers');
			const mockSleep = sleep as jest.MockedFunction<typeof sleep>;
			mockSleep.mockResolvedValue(undefined);

			const result = await removalWorkflowService.runRemovalInBatches({
				groupWaId: 'test-group',
				batchSize: 10,
				delayMs: 1000,
				dryRun: true,
			});

			// Verify database operations were NOT called in dryRun mode
			expect(mockRemovalQueueRepository.remove).not.toHaveBeenCalled();
			expect(mockRemovalHistoryRepository.add).not.toHaveBeenCalled();
			expect(
				mockGroupMembershipRepository.removeByUserAndGroup
			).not.toHaveBeenCalled();

			// Verify correct whatsappIds were returned
			expect(result).toEqual(['1234567890', '0987654321']);
		});

		it('should perform database operations when dryRun is false', async () => {
			// Import repositories after they are mocked
			const {
				groupRepository,
				removalQueueRepository,
				removalHistoryRepository,
				groupMembershipRepository,
			} = await import('@database/repositories');

			const mockGroupRepository = groupRepository as jest.Mocked<
				typeof groupRepository
			>;
			const mockRemovalQueueRepository = removalQueueRepository as jest.Mocked<
				typeof removalQueueRepository
			>;
			const mockRemovalHistoryRepository =
				removalHistoryRepository as jest.Mocked<
					typeof removalHistoryRepository
				>;
			const mockGroupMembershipRepository =
				groupMembershipRepository as jest.Mocked<
					typeof groupMembershipRepository
				>;

			mockFeatureFlagService.isEnabled.mockReturnValue(true);

			// Mock group lookup
			mockGroupRepository.getByWaId = jest
				.fn()
				.mockResolvedValue({ id: 'group-id-1' });

			// Mock queue items
			mockRemovalQueueRepository.getNextBatch = jest
				.fn()
				.mockResolvedValueOnce([
					{
						id: 'queue-1',
						user: { id: 'user-1', whatsappId: '1234567890' },
						group: { id: 'group-id-1' },
					},
				])
				.mockResolvedValueOnce([]); // Second call returns empty to end loop

			// Mock repository operations
			mockRemovalQueueRepository.remove = jest.fn();
			mockRemovalHistoryRepository.add = jest.fn();
			mockGroupMembershipRepository.removeByUserAndGroup = jest.fn();

			const { sleep } = await import('@logic/helpers');
			const mockSleep = sleep as jest.MockedFunction<typeof sleep>;
			mockSleep.mockResolvedValue(undefined);

			const result = await removalWorkflowService.runRemovalInBatches({
				groupWaId: 'test-group',
				batchSize: 10,
				delayMs: 1000,
				dryRun: false,
			});

			// Verify database operations WERE called in non-dryRun mode
			expect(mockRemovalQueueRepository.remove).toHaveBeenCalledWith('queue-1');
			expect(mockRemovalHistoryRepository.add).toHaveBeenCalledWith({
				userId: 'user-1',
				groupId: 'group-id-1',
				outcome: 'SUCCESS',
				reason: 'Inactive user removal',
			});
			expect(
				mockGroupMembershipRepository.removeByUserAndGroup
			).toHaveBeenCalledWith({
				userId: 'user-1',
				groupId: 'group-id-1',
			});

			// Verify correct whatsappIds were returned
			expect(result).toEqual(['1234567890']);
		});
	});
});
