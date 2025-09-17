import type { WebhookPayload } from '../types/evolution';
import { EVOLUTION_EVENTS } from './../constants/evolution';
import { isGroupMessage } from './helpers';
import { groupMapper } from './mappers';
import { ensureGroupMessageUpsert } from './services/messageService';
import { addInactiveMembersToRemovalQueue } from './services/removalQueueService';

export const handleMessageUpsert = async (
	update: WebhookPayload<typeof EVOLUTION_EVENTS.MESSAGES_UPSERT>
) => {
	const { data } = update;

	if (isGroupMessage(data)) {
		await ensureGroupMessageUpsert(data);

		await addInactiveMembersToRemovalQueue(groupMapper.id(data));
	}
};
