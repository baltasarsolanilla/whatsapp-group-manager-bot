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
			RUN_WORKFLOW: 'admin/removalQueue/runWorkflow',
		},
		LISTS: {
			WHITELIST: 'admin/lists/whitelist',
			BLACKLIST: 'admin/lists/blacklist',
		},
		GROUPS: {
			BASE: 'admin/groups',
			UPDATE: 'admin/groups/:id',
			INGEST: 'admin/groups/ingest',
		},
	},
};
