import config from '@config';

export enum FeatureFlag {
	BLACKLIST_AUTO_REMOVAL = 'BLACKLIST_AUTO_REMOVAL',
	BLACKLIST_ENFORCEMENT = 'BLACKLIST_ENFORCEMENT',
	QUEUE_REMOVAL = 'QUEUE_REMOVAL',
}

export const FeatureFlagService = {
	isEnabled(flag: FeatureFlag): boolean {
		// 1. Check environment override (highest priority)
		const envFlag = config[`FEATURE_${flag}`];
		if (envFlag !== undefined) {
			return envFlag === 'true';
		}
		// TODO: 2. Check cache
		// TODO: 3. Check database

		// Default to false if not found
		return false;
	},
};
