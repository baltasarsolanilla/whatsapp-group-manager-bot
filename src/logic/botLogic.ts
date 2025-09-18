import { EVOLUTION_EVENTS } from '@constants/evolutionConstants';
import { messageService, removalQueueService } from '@logic/services';
import type { WebhookEvent } from 'types/evolution';
import { isGroupMessage } from './helpers';
import { msgGroupMapper } from './mappers';

export const handleMessageUpsert = async (
	update: WebhookEvent<typeof EVOLUTION_EVENTS.MESSAGES_UPSERT>
) => {
	const { data } = update;

	if (isGroupMessage(data)) {
		await messageService.ensureGroupMessageUpsert(data);

		await removalQueueService.addInactiveMembersToRemovalQueue(
			msgGroupMapper.id(data)
		);
	}
};
