import {
	groupMembershipRepository,
	groupRepository,
	userRepository,
	whitelistRepository,
} from '@database/repositories';
import { GroupData } from 'types/evolution';
import { groupMapper } from './../mappers';

export const groupService = {
	// TODO: Add Atomicity
	async ingest(payload: GroupData) {
		// 1. Ensure group
		const group = await groupRepository.upsert({
			whatsappId: groupMapper.id(payload),
			name: groupMapper.name(payload),
		});

		const { participants } = payload;

		// 1. Ensure users
		const users = await Promise.all(
			payload.participants.map((participant) =>
				userRepository.upsert({
					whatsappId: participant.id,
					whatsappPn: participant.jid,
				})
			)
		);

		// 3. Ensure memberships
		const memberships = await Promise.all(
			users.map((user) =>
				groupMembershipRepository.upsertGroupMembership({
					user,
					group,
				})
			)
		);

		// 4. Add admins to whitelist
		// Find admin participants
		const adminWaIds = participants
			.filter((p) => ['superadmin', 'admin'].includes(p.admin ?? ''))
			.map((p) => p.id);

		// Get users that are admins
		const userAdmins = users.filter((user) =>
			adminWaIds.includes(user.whatsappId)
		);

		// Add all admin users to whitelist for this group
		const whitelist = await Promise.all(
			userAdmins.map((user) => whitelistRepository.upsert(user.id, group.id))
		);

		return { group, users, memberships, whitelist };
	},
};
