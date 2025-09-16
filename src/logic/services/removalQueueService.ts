import { inactiveMembers } from '@database/repositories/groupMembershipRepository';
import { getGroupByWaId } from '@database/repositories/groupRepository';
import { addUserToRemovalQueue } from '@database/repositories/removalQueueRepository';

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
