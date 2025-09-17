import {
	groupMembershipRepository,
	groupRepository,
	userRepository,
} from '@database/repositories';

type EnsureUserGroupMembershipType = {
	whatsappUserId: string;
	whatsappUserPn?: string;
	userName: string;
	whatsappGroupId: string;
	groupName: string;
};

export async function ensureUserGroupMembership({
	whatsappUserId,
	whatsappUserPn,
	userName,
	whatsappGroupId,
	groupName,
}: EnsureUserGroupMembershipType) {
	// 1. Ensure user
	const user = await userRepository.upsert({
		whatsappId: whatsappUserId,
		whatsappPn: whatsappUserPn,
		name: userName,
	});

	// 2. Ensure group
	const group = await groupRepository.upsert({
		whatsappId: whatsappGroupId,
		name: groupName,
	});

	// 3. Ensure membership
	const membership = await groupMembershipRepository.upsertGroupMembership({
		user,
		group,
	});

	return { user, group, membership };
}
