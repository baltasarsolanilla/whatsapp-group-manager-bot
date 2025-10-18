import {
	groupRepository,
	removalQueueRepository,
	userRepository,
} from '@database/repositories';
import { groupMembershipService } from '@logic/services';
import { isUserWhatsappId } from '@logic/helpers';
import { AppError } from '@utils/AppError';
import { RemovalQueue } from '@prisma/client';

export const removalQueueService = {
	/**
	 * Adds all inactive members to the removal queue for a given group.
	 * @param groupWaId The Group whatsapp id.
	 * @param inactivityWindowMs The inactivity window in milliseconds.
	 */
	async syncInactiveMembersToRemovalQueue(
		groupWaId: string,
		inactivityWindowMs: number
	) {
		const memberships = await groupMembershipService.getInactive(
			groupWaId,
			inactivityWindowMs
		);
		const newQueueMembers: RemovalQueue[] = [];
		for (const membership of memberships) {
			const newMember = await removalQueueRepository.upsertUser({
				userId: membership.user.id,
				groupId: membership.group.id,
			});
			newQueueMembers.push(newMember);
		}

		return newQueueMembers;
	},

	async listInactiveMembers(groupWaId?: string) {
		const groupId = groupWaId
			? (await groupRepository.getByWaId(groupWaId))?.id
			: undefined;

		return removalQueueRepository.getUsers(groupId);
	},

	/**
	 * Adds specific users to the removal queue for a given group.
	 * @param groupId The Group whatsapp id.
	 * @param participants Array of whatsapp user IDs (e.g., "224253244870684@lid").
	 * @returns Array of RemovalQueue entries that were added.
	 */
	async addInactiveMembersToRemovalQueue(
		groupId: string,
		participants: string[]
	): Promise<RemovalQueue[]> {
		// 1. Check that groupId exists
		const group = await groupRepository.getByWaId(groupId);
		if (!group) {
			throw AppError.badRequest('Group not found');
		}

		// 2. Validate participants are whatsappIds
		const invalidParticipants = participants.filter(
			(id) => !isUserWhatsappId(id)
		);
		if (invalidParticipants.length > 0) {
			throw AppError.badRequest(
				`Invalid whatsappId format. Expected format: xxxxx@lid. Invalid IDs: ${invalidParticipants.join(', ')}`
			);
		}

		// 3. Add entries to removalQueue, ignoring whatsappIds that don't exist in User DB
		const addedEntries: RemovalQueue[] = [];
		for (const whatsappId of participants) {
			const user = await userRepository.getByWaId(whatsappId);
			if (user) {
				const entry = await removalQueueRepository.upsertUser({
					userId: user.id,
					groupId: group.id,
				});
				addedEntries.push(entry);
			}
			// Silently ignore users that don't exist in the DB
		}

		// 4. Return all entries added
		return addedEntries;
	},

	/**
	 * Clears all entries from the removal queue.
	 * @returns The result with count of deleted records.
	 */
	async clearAllQueue() {
		return removalQueueRepository.deleteAll();
	},

	/**
	 * Populates the removal queue with specific users for a given group.
	 * This is a hardcoded admin endpoint that takes user IDs and group ID directly.
	 * @param groupId The Group whatsapp id (e.g., "120363403645737238@g.us").
	 * @param userIds Array of whatsapp user IDs (e.g., ["94472671117354@lid"]).
	 * @returns Summary object with counts of intended, inserted, and missing users.
	 */
	async hardcodePopulateRemovalQueue(
		groupId: string,
		userIds: string[]
	): Promise<{
		intended: number;
		inserted: number;
		missing: number;
		missingUserIds: string[];
	}> {
		// 1. Resolve the group
		const group = await groupRepository.getByWaId(groupId);
		if (!group) {
			throw AppError.badRequest('Group not found');
		}

		// 2. Resolve all users and track which ones exist
		const userResolutionPromises = userIds.map(async (whatsappId) => {
			const user = await userRepository.getByWaId(whatsappId);
			return { whatsappId, user };
		});

		const userResolutions = await Promise.all(userResolutionPromises);

		// 3. Separate existing users from missing ones
		const existingUsers = userResolutions
			.filter((r) => r.user !== null)
			.map((r) => ({ userId: r.user!.id, groupId: group.id }));

		const missingUserIds = userResolutions
			.filter((r) => r.user === null)
			.map((r) => r.whatsappId);

		// 4. Batch insert existing users into removal queue using createMany with skipDuplicates
		let insertedCount = 0;
		if (existingUsers.length > 0) {
			const result = await removalQueueRepository.createMany(existingUsers);
			insertedCount = result.count;
		}

		// 5. Return summary
		return {
			intended: userIds.length,
			inserted: insertedCount,
			missing: missingUserIds.length,
			missingUserIds,
		};
	},
};
