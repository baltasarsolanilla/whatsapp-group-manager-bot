import {
	groupMembershipRepository,
	groupRepository,
	messageRepository,
	userRepository,
} from '@database/repositories';
import { MessageUpsert } from 'types/evolution';
import { messageMapper, msgGroupMapper, msgUserMapper } from './../mappers';

export const messageService = {
	async ensureGroupMessageUpsert(payload: MessageUpsert) {
		// 1. Ensure user
		const user = await userRepository.upsert({
			whatsappId: msgUserMapper.id(payload),
			whatsappPn: msgUserMapper.pn(payload),
			name: msgUserMapper.name(payload),
		});

		// 2. Ensure group
		const group = await groupRepository.upsert({
			whatsappId: msgGroupMapper.id(payload),
		});

		// 3. Ensure membership
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
