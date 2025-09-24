import { PATHS } from '@constants/routesConstants';

describe('Routes Constants', () => {
	describe('Root paths', () => {
		it('should have correct default path', () => {
			expect(PATHS.DEFAULT).toBe('/');
		});

		it('should have correct webhook path', () => {
			expect(PATHS.WEBHOOK).toBe('/webhook');
		});
	});

	describe('Admin paths', () => {
		it('should have correct removal queue paths', () => {
			expect(PATHS.ADMIN.REMOVAL_QUEUE.BASE).toBe('admin/removalQueue');
			expect(PATHS.ADMIN.REMOVAL_QUEUE.RUN).toBe('admin/removalQueue/run');
			expect(PATHS.ADMIN.REMOVAL_QUEUE.SYNC).toBe('admin/removalQueue/sync');
			expect(PATHS.ADMIN.REMOVAL_QUEUE.RUN_WORKFLOW).toBe(
				'admin/removalQueue/runWorkflow'
			);
		});

		it('should have correct list paths', () => {
			expect(PATHS.ADMIN.LISTS.WHITELIST).toBe('admin/lists/whitelist');
			expect(PATHS.ADMIN.LISTS.BLACKLIST).toBe('admin/lists/blacklist');
		});

		it('should have correct group paths', () => {
			expect(PATHS.ADMIN.GROUPS.BASE).toBe('admin/groups');
			expect(PATHS.ADMIN.GROUPS.UPDATE).toBe('admin/groups/:id');
			expect(PATHS.ADMIN.GROUPS.INGEST).toBe('admin/groups/ingest');
		});
	});

	describe('Path structure', () => {
		it('should have nested admin object', () => {
			expect(typeof PATHS.ADMIN).toBe('object');
			expect(PATHS.ADMIN).toHaveProperty('REMOVAL_QUEUE');
			expect(PATHS.ADMIN).toHaveProperty('LISTS');
			expect(PATHS.ADMIN).toHaveProperty('GROUPS');
		});

		it('should have consistent naming pattern', () => {
			// All admin paths should start with 'admin/'
			const adminPaths = [
				PATHS.ADMIN.REMOVAL_QUEUE.BASE,
				PATHS.ADMIN.REMOVAL_QUEUE.RUN,
				PATHS.ADMIN.REMOVAL_QUEUE.SYNC,
				PATHS.ADMIN.REMOVAL_QUEUE.RUN_WORKFLOW,
				PATHS.ADMIN.LISTS.WHITELIST,
				PATHS.ADMIN.LISTS.BLACKLIST,
				PATHS.ADMIN.GROUPS.BASE,
				PATHS.ADMIN.GROUPS.INGEST,
			];

			adminPaths.forEach((path) => {
				expect(path).toMatch(/^admin\//);
			});
		});
	});
});
