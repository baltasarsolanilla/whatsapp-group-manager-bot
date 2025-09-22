export const PATHS = {
	// ======================== BOT ========================
	DEFAULT: '/',
	WEBHOOK: '/webhook',

	// ======================== ADMIN ========================
	ADMIN: {
		REMOVAL_QUEUE: {
			BASE: 'admin/removalQueue',
			RUN: 'admin/removalQueue/run',
			SYNC: 'admin/removalQueue/sync',
		},
		LISTS: {
			WHITELIST: 'admin/lists/whitelist',
			BLACKLIST: 'admin/lists/blacklist',
		},
		GROUPS: {
			INGEST: 'admin/groups/ingest',
			UPDATE: 'admin/groups/update',
		},
	},
};
