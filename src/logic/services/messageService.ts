import { upsertGroupMembership } from '@database/repositories/groupMembershipRepository';
import { upsertGroup } from '@database/repositories/groupRepository';
import { addMessage } from '@database/repositories/messageRepository';
import { upsertUser } from '@database/repositories/userRepository';
import { MessageUpsert } from 'types/evolution';
import { groupMapper, messageMapper, userMapper } from './../mappers';

export async function ensureGroupMessageUpsert(payload: MessageUpsert) {
	// 1. Ensure user
	const user = await upsertUser({
		whatsappId: userMapper.id(payload),
		whatsappPn: userMapper.pn(payload),
		name: userMapper.name(payload),
	});

	// 2. Ensure group
	const group = await upsertGroup({
		whatsappId: groupMapper.id(payload),
		name: '',
	});

	// 3. Ensure membership
	const membership = await upsertGroupMembership({
		user,
		group,
	});

	// 4. Ensure message
	const message = await addMessage({
		user,
		group,
		whatsappId: messageMapper.id(payload),
		messageType: messageMapper.type(payload),
		messageTimestamp: messageMapper.timestamp(payload),
	});

	return { user, group, membership, message };
}
