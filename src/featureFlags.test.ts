import config from '@config';
import { FeatureFlag, FeatureFlagService } from './featureFlags';

// Mock the config module
jest.mock('@config', () => ({
	FEATURE_BLACKLIST_AUTO_REMOVAL: undefined,
	FEATURE_BLACKLIST_ENFORCEMENT: undefined,
	FEATURE_QUEUE_REMOVAL: undefined,
}));

describe('FeatureFlagService', () => {
	beforeEach(() => {
		// Reset config mocks before each test
		(config as any).FEATURE_BLACKLIST_AUTO_REMOVAL = undefined;
		(config as any).FEATURE_BLACKLIST_ENFORCEMENT = undefined;
		(config as any).FEATURE_QUEUE_REMOVAL = undefined;
	});

	describe('isEnabled', () => {
		it('should return false by default when no environment flag is set', () => {
			expect(FeatureFlagService.isEnabled(FeatureFlag.BLACKLIST_AUTO_REMOVAL)).toBe(false);
			expect(FeatureFlagService.isEnabled(FeatureFlag.BLACKLIST_ENFORCEMENT)).toBe(false);
			expect(FeatureFlagService.isEnabled(FeatureFlag.QUEUE_REMOVAL)).toBe(false);
		});

		it('should return true when environment flag is set to "true"', () => {
			(config as any).FEATURE_BLACKLIST_AUTO_REMOVAL = 'true';
			(config as any).FEATURE_BLACKLIST_ENFORCEMENT = 'true';
			(config as any).FEATURE_QUEUE_REMOVAL = 'true';

			expect(FeatureFlagService.isEnabled(FeatureFlag.BLACKLIST_AUTO_REMOVAL)).toBe(true);
			expect(FeatureFlagService.isEnabled(FeatureFlag.BLACKLIST_ENFORCEMENT)).toBe(true);
			expect(FeatureFlagService.isEnabled(FeatureFlag.QUEUE_REMOVAL)).toBe(true);
		});

		it('should return false when environment flag is set to "false"', () => {
			(config as any).FEATURE_BLACKLIST_AUTO_REMOVAL = 'false';
			(config as any).FEATURE_BLACKLIST_ENFORCEMENT = 'false';
			(config as any).FEATURE_QUEUE_REMOVAL = 'false';

			expect(FeatureFlagService.isEnabled(FeatureFlag.BLACKLIST_AUTO_REMOVAL)).toBe(false);
			expect(FeatureFlagService.isEnabled(FeatureFlag.BLACKLIST_ENFORCEMENT)).toBe(false);
			expect(FeatureFlagService.isEnabled(FeatureFlag.QUEUE_REMOVAL)).toBe(false);
		});

		it('should return false when environment flag is set to any other value', () => {
			(config as any).FEATURE_BLACKLIST_AUTO_REMOVAL = 'yes';
			(config as any).FEATURE_BLACKLIST_ENFORCEMENT = '1';
			(config as any).FEATURE_QUEUE_REMOVAL = 'enabled';

			expect(FeatureFlagService.isEnabled(FeatureFlag.BLACKLIST_AUTO_REMOVAL)).toBe(false);
			expect(FeatureFlagService.isEnabled(FeatureFlag.BLACKLIST_ENFORCEMENT)).toBe(false);
			expect(FeatureFlagService.isEnabled(FeatureFlag.QUEUE_REMOVAL)).toBe(false);
		});
	});

	describe('Feature Flag Enum', () => {
		it('should have the correct flag names', () => {
			expect(FeatureFlag.BLACKLIST_AUTO_REMOVAL).toBe('BLACKLIST_AUTO_REMOVAL');
			expect(FeatureFlag.BLACKLIST_ENFORCEMENT).toBe('BLACKLIST_ENFORCEMENT');
			expect(FeatureFlag.QUEUE_REMOVAL).toBe('QUEUE_REMOVAL');
		});
	});
});