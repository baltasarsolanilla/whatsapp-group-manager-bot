import { ensureUserGroupMembership } from '@logic/services/groupMembershipService';
import type { WebhookPayload } from '../types/evolution';
import { EVOLUTION_EVENTS } from './../constants/evolution';
import { isGroupMessage } from './helpers';
import { groupMapper, userMapper } from './mappers';
import { addInactiveMembersToRemovalQueue } from './services/removalQueueService';

export const handleMessageUpsert = async (
	update: WebhookPayload<typeof EVOLUTION_EVENTS.MESSAGES_UPSERT>
) => {
	const { data } = update;

	if (isGroupMessage(data)) {
		await ensureUserGroupMembership({
			whatsappUserId: userMapper.id(data),
			whatsappUserPn: userMapper.pn(data),
			userName: userMapper.name(data),
			whatsappGroupId: groupMapper.id(data),
			groupName: 'unknown',
		});

		await addInactiveMembersToRemovalQueue(groupMapper.id(data));
	}
};
