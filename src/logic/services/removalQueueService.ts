import { inactiveMembers } from '@database/repositories/groupMembershipRepository';
import { getGroupByWaId } from '@database/repositories/groupRepository';
import {
	addUserToRemovalQueue,
	fetchMembers,
	updateRemovalStatus,
} from '@database/repositories/removalQueueRepository';
import { RemovalStatus } from '@prisma/client';
import { evolutionAPI } from '@services/evolutionAPI';

/**
 * Adds all inactive members to the removal queue for a given group.
 * @param group The Group object.
 */
export async function addInactiveMembersToRemovalQueue(groupId: string) {
	const group = await getGroupByWaId(groupId);

	if (!group) {
		console.warn(
			'addInactiveMembersToRemovalQueue() - Group not found',
			groupId
		);
		return;
	}

	const memberships = await inactiveMembers(group);
	for (const membership of memberships) {
		await addUserToRemovalQueue(membership);
	}
}

export async function listInactiveMembers(
	groupWaId?: string,
	processStatus?: RemovalStatus
) {
	const groupId = groupWaId ? (await getGroupByWaId(groupWaId))?.id : undefined;

	return fetchMembers(groupId, processStatus);
}

// ! Need to implement batch logic to avoid max limits
export async function removeInactiveMembers(groupWaId?: string) {
	const groupId = groupWaId ? (await getGroupByWaId(groupWaId))?.id : undefined;

	if (groupId) {
		const removedMemberIds: string[] = [];
		const entriesToRemove = await listInactiveMembers(
			groupId,
			RemovalStatus.PENDING
		);

		for (const entry of entriesToRemove) {
			try {
				await evolutionAPI.removeMember(entry.userId, entry.groupId);
				updateRemovalStatus(entry.id, RemovalStatus.PROCESSED);
				removedMemberIds.concat(entry.userId);
			} catch {
				updateRemovalStatus(entry.id, RemovalStatus.FAILED);
			}
		}

		return removedMemberIds;
	}

	return [];
}
