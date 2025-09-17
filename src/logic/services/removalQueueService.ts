import { inactiveMembers } from '@database/repositories/groupMembershipRepository';
import { getGroupByWaId } from '@database/repositories/groupRepository';
import {
	addUserToRemovalQueue,
	fetchMembers,
	updateRemovalStatus,
} from '@database/repositories/removalQueueRepository';
import { extractPhoneNumberFromWhatsappPn } from '@logic/helpers';
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

export async function removeInactiveMembers(groupWaId?: string) {
	const groupId = groupWaId ? (await getGroupByWaId(groupWaId))?.id : undefined;

	if (groupId && groupWaId) {
		const removedMemberIds: string[] = [];
		const entriesToRemove = await listInactiveMembers(
			groupId,
			RemovalStatus.PENDING
		);

		// ! Need to implement batch logic to avoid max limits
		// * Let's make a batch of 2 for now
		const firstBatch = entriesToRemove.slice(0, 2);
		const participants = firstBatch.map((entry) =>
			extractPhoneNumberFromWhatsappPn(entry.user.whatsappPn)
		);

		try {
			await evolutionAPI.removeMembers(participants, groupWaId);
			for (const entry of firstBatch) {
				await updateRemovalStatus(entry.id, RemovalStatus.PROCESSED);
				removedMemberIds.push(entry.userId);
			}
		} catch {
			for (const entry of firstBatch) {
				await updateRemovalStatus(entry.id, RemovalStatus.FAILED);
				removedMemberIds.push(entry.userId);
			}
		}
		return participants;
	}

	return [];
}
