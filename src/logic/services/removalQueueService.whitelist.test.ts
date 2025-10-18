import { removalQueueService } from './removalQueueService';
import {
	groupRepository,
	removalQueueRepository,
	userRepository,
	whitelistRepository,
} from '@database/repositories';
import { groupMembershipService } from '@logic/services';

// Mock all dependencies
jest.mock('@database/repositories');
jest.mock('@logic/services', () => ({
	groupMembershipService: {
		getInactive: jest.fn(),
	},
}));
jest.mock('@logic/helpers', () => ({
	isUserWhatsappId: jest.fn(() => true), // Mock to always return true for tests
}));

const mockGroupRepository = groupRepository as jest.Mocked<
	typeof groupRepository
>;
const mockRemovalQueueRepository = removalQueueRepository as jest.Mocked<
	typeof removalQueueRepository
>;
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockWhitelistRepository = whitelistRepository as jest.Mocked<
	typeof whitelistRepository
>;
const mockGroupMembershipService = groupMembershipService as jest.Mocked<
	typeof groupMembershipService
>;

describe('RemovalQueueService - Whitelist Exclusion', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('syncInactiveMembersToRemovalQueue', () => {
		it('should skip whitelisted members when syncing inactive members', async () => {
			const groupWaId = 'test-group@g.us';
			const inactivityWindowMs = 2592000000;

			// Mock inactive members - 3 members, 1 is whitelisted
			mockGroupMembershipService.getInactive.mockResolvedValue([
				{
					user: { id: 'user-1', whatsappId: 'user1@lid', name: 'User 1' },
					group: { id: 'group-1', whatsappId: groupWaId, name: 'Test Group' },
				},
				{
					user: { id: 'user-2', whatsappId: 'user2@lid', name: 'User 2' },
					group: { id: 'group-1', whatsappId: groupWaId, name: 'Test Group' },
				},
				{
					user: { id: 'user-3', whatsappId: 'user3@lid', name: 'User 3' },
					group: { id: 'group-1', whatsappId: groupWaId, name: 'Test Group' },
				},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			] as any);

			// Mock whitelist check - user-2 is whitelisted
			mockWhitelistRepository.exists.mockImplementation(
				async (userId: string, groupId: string) => {
					return userId === 'user-2' && groupId === 'group-1';
				}
			);

			// Mock upsertUser
			mockRemovalQueueRepository.upsertUser.mockImplementation(
				async ({ userId, groupId }) => {
					return {
						id: `queue-${userId}`,
						userId,
						groupId,
						createdAt: new Date(),
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
					} as any;
				}
			);

			const result =
				await removalQueueService.syncInactiveMembersToRemovalQueue(
					groupWaId,
					inactivityWindowMs
				);

			// Should have been called 3 times (once per user)
			expect(mockWhitelistRepository.exists).toHaveBeenCalledTimes(3);

			// Should only upsert non-whitelisted users (user-1 and user-3)
			expect(mockRemovalQueueRepository.upsertUser).toHaveBeenCalledTimes(2);
			expect(mockRemovalQueueRepository.upsertUser).toHaveBeenCalledWith({
				userId: 'user-1',
				groupId: 'group-1',
			});
			expect(mockRemovalQueueRepository.upsertUser).toHaveBeenCalledWith({
				userId: 'user-3',
				groupId: 'group-1',
			});
			expect(mockRemovalQueueRepository.upsertUser).not.toHaveBeenCalledWith({
				userId: 'user-2',
				groupId: 'group-1',
			});

			// Result should only include non-whitelisted users
			expect(result).toHaveLength(2);
			expect(result.map((r) => r.userId)).toEqual(['user-1', 'user-3']);
		});

		it('should add all members when none are whitelisted', async () => {
			const groupWaId = 'test-group@g.us';
			const inactivityWindowMs = 2592000000;

			// Mock inactive members - 2 members, none whitelisted
			mockGroupMembershipService.getInactive.mockResolvedValue([
				{
					user: { id: 'user-1', whatsappId: 'user1@lid', name: 'User 1' },
					group: { id: 'group-1', whatsappId: groupWaId, name: 'Test Group' },
				},
				{
					user: { id: 'user-2', whatsappId: 'user2@lid', name: 'User 2' },
					group: { id: 'group-1', whatsappId: groupWaId, name: 'Test Group' },
				},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			] as any);

			// Mock whitelist check - no users are whitelisted
			mockWhitelistRepository.exists.mockResolvedValue(false);

			// Mock upsertUser
			mockRemovalQueueRepository.upsertUser.mockImplementation(
				async ({ userId, groupId }) => {
					return {
						id: `queue-${userId}`,
						userId,
						groupId,
						createdAt: new Date(),
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
					} as any;
				}
			);

			const result =
				await removalQueueService.syncInactiveMembersToRemovalQueue(
					groupWaId,
					inactivityWindowMs
				);

			// Should upsert all users
			expect(mockRemovalQueueRepository.upsertUser).toHaveBeenCalledTimes(2);
			expect(result).toHaveLength(2);
		});

		it('should add no members when all are whitelisted', async () => {
			const groupWaId = 'test-group@g.us';
			const inactivityWindowMs = 2592000000;

			// Mock inactive members - 2 members, both whitelisted
			mockGroupMembershipService.getInactive.mockResolvedValue([
				{
					user: { id: 'user-1', whatsappId: 'user1@lid', name: 'User 1' },
					group: { id: 'group-1', whatsappId: groupWaId, name: 'Test Group' },
				},
				{
					user: { id: 'user-2', whatsappId: 'user2@lid', name: 'User 2' },
					group: { id: 'group-1', whatsappId: groupWaId, name: 'Test Group' },
				},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			] as any);

			// Mock whitelist check - all users are whitelisted
			mockWhitelistRepository.exists.mockResolvedValue(true);

			const result =
				await removalQueueService.syncInactiveMembersToRemovalQueue(
					groupWaId,
					inactivityWindowMs
				);

			// Should not upsert any users
			expect(mockRemovalQueueRepository.upsertUser).not.toHaveBeenCalled();
			expect(result).toHaveLength(0);
		});
	});

	describe('addInactiveMembersToRemovalQueue', () => {
		it('should skip whitelisted members when adding specific users', async () => {
			const groupWaId = 'test-group@g.us';
			const participants = ['user1@lid', 'user2@lid', 'user3@lid'];

			// Mock group lookup
			mockGroupRepository.getByWaId.mockResolvedValue({
				id: 'group-1',
				whatsappId: groupWaId,
				name: 'Test Group',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any);

			// Mock user lookup
			mockUserRepository.getByWaId.mockImplementation(async (whatsappId) => {
				const userId = whatsappId.replace('@lid', '');
				return {
					id: userId,
					whatsappId,
					name: `User ${userId}`,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} as any;
			});

			// Mock whitelist check - user2 is whitelisted
			mockWhitelistRepository.exists.mockImplementation(
				async (userId: string, groupId: string) => {
					return userId === 'user2' && groupId === 'group-1';
				}
			);

			// Mock upsertUser
			mockRemovalQueueRepository.upsertUser.mockImplementation(
				async ({ userId, groupId }) => {
					return {
						id: `queue-${userId}`,
						userId,
						groupId,
						createdAt: new Date(),
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
					} as any;
				}
			);

			const result = await removalQueueService.addInactiveMembersToRemovalQueue(
				groupWaId,
				participants
			);

			// Should only upsert non-whitelisted users (user1 and user3)
			expect(mockRemovalQueueRepository.upsertUser).toHaveBeenCalledTimes(2);
			expect(mockRemovalQueueRepository.upsertUser).toHaveBeenCalledWith({
				userId: 'user1',
				groupId: 'group-1',
			});
			expect(mockRemovalQueueRepository.upsertUser).toHaveBeenCalledWith({
				userId: 'user3',
				groupId: 'group-1',
			});
			expect(mockRemovalQueueRepository.upsertUser).not.toHaveBeenCalledWith({
				userId: 'user2',
				groupId: 'group-1',
			});

			// Result should only include non-whitelisted users
			expect(result).toHaveLength(2);
		});

		it('should add all users when none are whitelisted', async () => {
			const groupWaId = 'test-group@g.us';
			const participants = ['user1@lid', 'user2@lid'];

			// Mock group lookup
			mockGroupRepository.getByWaId.mockResolvedValue({
				id: 'group-1',
				whatsappId: groupWaId,
				name: 'Test Group',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any);

			// Mock user lookup
			mockUserRepository.getByWaId.mockImplementation(async (whatsappId) => {
				const userId = whatsappId.replace('@lid', '');
				return {
					id: userId,
					whatsappId,
					name: `User ${userId}`,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} as any;
			});

			// Mock whitelist check - no users are whitelisted
			mockWhitelistRepository.exists.mockResolvedValue(false);

			// Mock upsertUser
			mockRemovalQueueRepository.upsertUser.mockImplementation(
				async ({ userId, groupId }) => {
					return {
						id: `queue-${userId}`,
						userId,
						groupId,
						createdAt: new Date(),
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
					} as any;
				}
			);

			const result = await removalQueueService.addInactiveMembersToRemovalQueue(
				groupWaId,
				participants
			);

			// Should upsert all users
			expect(mockRemovalQueueRepository.upsertUser).toHaveBeenCalledTimes(2);
			expect(result).toHaveLength(2);
		});
	});

	describe('hardcodePopulateRemovalQueue', () => {
		it('should skip whitelisted members and report them in response', async () => {
			const groupWaId = 'test-group@g.us';
			const userIds = ['user1@lid', 'user2@lid', 'user3@lid'];

			// Mock group lookup
			mockGroupRepository.getByWaId.mockResolvedValue({
				id: 'group-1',
				whatsappId: groupWaId,
				name: 'Test Group',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any);

			// Mock user lookup
			mockUserRepository.getByWaId.mockImplementation(async (whatsappId) => {
				const userId = whatsappId.replace('@lid', '');
				return {
					id: userId,
					whatsappId,
					name: `User ${userId}`,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} as any;
			});

			// Mock whitelist check - user2 is whitelisted
			mockWhitelistRepository.exists.mockImplementation(
				async (userId: string, groupId: string) => {
					return userId === 'user2' && groupId === 'group-1';
				}
			);

			// Mock createMany
			mockRemovalQueueRepository.createMany.mockResolvedValue({ count: 2 });

			const result = await removalQueueService.hardcodePopulateRemovalQueue(
				groupWaId,
				userIds
			);

			// Should create entries for non-whitelisted users only
			expect(mockRemovalQueueRepository.createMany).toHaveBeenCalledWith([
				{ userId: 'user1', groupId: 'group-1' },
				{ userId: 'user3', groupId: 'group-1' },
			]);

			// Result should include whitelist skip information
			expect(result).toEqual({
				intended: 3,
				inserted: 2,
				missing: 0,
				missingUserIds: [],
				skippedWhitelisted: 1,
				skippedWhitelistedIds: ['user2@lid'],
			});
		});

		it('should handle mix of missing and whitelisted users', async () => {
			const groupWaId = 'test-group@g.us';
			const userIds = ['user1@lid', 'user2@lid', 'user3@lid', 'user4@lid'];

			// Mock group lookup
			mockGroupRepository.getByWaId.mockResolvedValue({
				id: 'group-1',
				whatsappId: groupWaId,
				name: 'Test Group',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any);

			// Mock user lookup - user4 doesn't exist
			mockUserRepository.getByWaId.mockImplementation(async (whatsappId) => {
				if (whatsappId === 'user4@lid') {
					return null;
				}
				const userId = whatsappId.replace('@lid', '');
				return {
					id: userId,
					whatsappId,
					name: `User ${userId}`,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} as any;
			});

			// Mock whitelist check - user2 is whitelisted
			mockWhitelistRepository.exists.mockImplementation(
				async (userId: string, groupId: string) => {
					return userId === 'user2' && groupId === 'group-1';
				}
			);

			// Mock createMany
			mockRemovalQueueRepository.createMany.mockResolvedValue({ count: 2 });

			const result = await removalQueueService.hardcodePopulateRemovalQueue(
				groupWaId,
				userIds
			);

			// Should create entries for non-whitelisted, existing users only (user1 and user3)
			expect(mockRemovalQueueRepository.createMany).toHaveBeenCalledWith([
				{ userId: 'user1', groupId: 'group-1' },
				{ userId: 'user3', groupId: 'group-1' },
			]);

			// Result should include both missing and whitelisted information
			expect(result).toEqual({
				intended: 4,
				inserted: 2,
				missing: 1,
				missingUserIds: ['user4@lid'],
				skippedWhitelisted: 1,
				skippedWhitelistedIds: ['user2@lid'],
			});
		});

		it('should insert no users when all are whitelisted', async () => {
			const groupWaId = 'test-group@g.us';
			const userIds = ['user1@lid', 'user2@lid'];

			// Mock group lookup
			mockGroupRepository.getByWaId.mockResolvedValue({
				id: 'group-1',
				whatsappId: groupWaId,
				name: 'Test Group',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any);

			// Mock user lookup
			mockUserRepository.getByWaId.mockImplementation(async (whatsappId) => {
				const userId = whatsappId.replace('@lid', '');
				return {
					id: userId,
					whatsappId,
					name: `User ${userId}`,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} as any;
			});

			// Mock whitelist check - all users are whitelisted
			mockWhitelistRepository.exists.mockResolvedValue(true);

			const result = await removalQueueService.hardcodePopulateRemovalQueue(
				groupWaId,
				userIds
			);

			// Should not create any entries
			expect(mockRemovalQueueRepository.createMany).not.toHaveBeenCalled();

			// Result should show all users were skipped as whitelisted
			expect(result).toEqual({
				intended: 2,
				inserted: 0,
				missing: 0,
				missingUserIds: [],
				skippedWhitelisted: 2,
				skippedWhitelistedIds: ['user1@lid', 'user2@lid'],
			});
		});
	});
});
