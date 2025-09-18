// add group to database and users

import {
	groupMembershipRepository,
	groupRepository,
	userRepository,
} from '@database/repositories';
import { GroupData } from 'types/evolution';
import { groupMapper } from './../mappers';

export const groupService = {
	async ingest(payload: GroupData) {
		// 1. Ensure group
		const group = await groupRepository.upsert({
			whatsappId: groupMapper.id(payload),
			name: groupMapper.name(payload),
		});

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

		return { group, users, memberships };
	},
};
