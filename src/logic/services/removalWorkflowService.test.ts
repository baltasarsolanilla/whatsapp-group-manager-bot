import { removalWorkflowService } from './removalWorkflowService';
import { FeatureFlag, FeatureFlagService } from '../../featureFlags';

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

const mockFeatureFlagService = FeatureFlagService as jest.Mocked<typeof FeatureFlagService>;

describe('RemovalWorkflowService - Feature Flag Integration', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('runWorkflow', () => {
		it('should skip workflow execution when QUEUE_REMOVAL flag is disabled', async () => {
			mockFeatureFlagService.isEnabled.mockReturnValue(false);

			const result = await removalWorkflowService.runWorkflow({
				batchSize: 10,
				delayMs: 1000,
				groupWaId: 'test-group',
				dryRun: true,
			});

			expect(mockFeatureFlagService.isEnabled).toHaveBeenCalledWith(FeatureFlag.QUEUE_REMOVAL);
			expect(result).toEqual([]);
		});

		it('should proceed with workflow execution when QUEUE_REMOVAL flag is enabled', async () => {
			mockFeatureFlagService.isEnabled.mockReturnValue(true);

			// Mock the dependencies to prevent actual execution
			const mockSyncRemovalQueue = jest.spyOn(removalWorkflowService, 'syncRemovalQueue');
			const mockRunRemovalInBatches = jest.spyOn(removalWorkflowService, 'runRemovalInBatches');
			
			mockSyncRemovalQueue.mockResolvedValue([]);
			mockRunRemovalInBatches.mockResolvedValue([]);

			await removalWorkflowService.runWorkflow({
				batchSize: 10,
				delayMs: 1000,
				groupWaId: 'test-group',
				dryRun: true,
			});

			expect(mockFeatureFlagService.isEnabled).toHaveBeenCalledWith(FeatureFlag.QUEUE_REMOVAL);
			expect(mockSyncRemovalQueue).toHaveBeenCalledWith('test-group');
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

			expect(mockFeatureFlagService.isEnabled).toHaveBeenCalledWith(FeatureFlag.QUEUE_REMOVAL);
			expect(result).toEqual([]);
		});
	});
});