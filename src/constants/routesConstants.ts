export const PATHS = {
	// ======================== BOT ========================
	DEFAULT: '/',
	WEBHOOK: '/webhook',

	// ======================== ADMIN ========================
	ADMIN: {
		REMOVE_QUEUE: 'admin/removeQueue',
		LISTS: {
			WHITELIST: 'admin/list/whitelist',
			BLACKLIST: 'admin/list/blacklist',
		},
		GROUPS: {
			INGEST: 'admin/groups/ingest',
			UPDATE: 'admin/groups/update',
		},
	},
};
