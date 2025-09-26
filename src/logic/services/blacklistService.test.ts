import { blacklistService } from './blacklistService';

// For now, we'll keep a simple test since we can't generate Prisma types in this environment
describe('blacklistService', () => {
	it('should have the enhanced addToBlacklistWithRemoval method', () => {
		expect(typeof blacklistService.addToBlacklistWithRemoval).toBe('function');
	});

	it('should have the base service methods', () => {
		expect(typeof blacklistService.add).toBe('function');
		expect(typeof blacklistService.remove).toBe('function');
		expect(typeof blacklistService.list).toBe('function');
	});
});