import { groupMembershipRepository } from '@database/repositories/groupMembershipRepository';
import { groupRepository } from '@database/repositories/groupRepository';
import { removalQueueRepository } from '@database/repositories/removalQueueRepository';
import { extractPhoneNumberFromWhatsappPn } from '@logic/helpers';
import { RemovalStatus } from '@prisma/client';
import { evolutionAPI } from '@services/evolutionAPI';

/**
 * Adds all inactive members to the removal queue for a given group.
 * @param group The Group object.
 */
export async function addInactiveMembersToRemovalQueue(groupId: string) {
	const group = await groupRepository.getByWaId(groupId);

	if (!group) {
		console.warn(
			'addInactiveMembersToRemovalQueue() - Group not found',
			groupId
		);
		return;
	}

	const memberships = await groupMembershipRepository.inactiveMembers(group);
	for (const membership of memberships) {
		await removalQueueRepository.addUser(membership);
	}
}

export async function listInactiveMembers(
	groupWaId?: string,
	processStatus?: RemovalStatus
) {
	const groupId = groupWaId
		? (await groupRepository.getByWaId(groupWaId))?.id
		: undefined;

	return removalQueueRepository.getUsersByGroupId(groupId, processStatus);
}

export async function removeInactiveMembers(groupWaId?: string) {
	const groupId = groupWaId
		? (await groupRepository.getByWaId(groupWaId))?.id
		: undefined;

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
			await evolutionAPI.groupService.removeMembers(participants, groupWaId);
			for (const entry of firstBatch) {
				await removalQueueRepository.updateStatusById(
					entry.id,
					RemovalStatus.PROCESSED
				);
				removedMemberIds.push(entry.userId);
			}
		} catch {
			for (const entry of firstBatch) {
				await removalQueueRepository.updateStatusById(
					entry.id,
					RemovalStatus.FAILED
				);
				removedMemberIds.push(entry.userId);
			}
		}
		return participants;
	}

	return [];
}
