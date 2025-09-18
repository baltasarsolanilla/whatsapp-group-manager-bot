import {
	groupMembershipRepository,
	messageRepository,
	userRepository,
} from '@database/repositories';
import { MessageUpsert } from 'types/evolution';
import { messageMapper, msgGroupMapper, msgUserMapper } from './../mappers';
import { groupService } from './groupService';

export const messageService = {
	async ensureGroupMessageUpsert(payload: MessageUpsert) {
		// 1. Ensure group
		const group = await groupService.ensure(msgGroupMapper.id(payload));

		if (!group) {
			return;
		}

		// 2. Ensure user
		const user = await userRepository.upsert({
			whatsappId: msgUserMapper.id(payload),
			whatsappPn: msgUserMapper.pn(payload),
			name: msgUserMapper.name(payload),
		});

		// 3. Ensure membership & update lastActiveAt to keep track of activity
		const membership = await groupMembershipRepository.upsertGroupMembership({
			user,
			group,
		});

		// 4. Ensure message
		const message = await messageRepository.add({
			user,
			group,
			whatsappId: messageMapper.id(payload),
			messageType: messageMapper.type(payload),
			messageTimestamp: messageMapper.timestamp(payload),
		});

		return { user, group, membership, message };
	},
};
