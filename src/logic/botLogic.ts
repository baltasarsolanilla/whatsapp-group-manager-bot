import { EVOLUTION_EVENTS } from '@constants/evolutionConstants';
import { messageService, removalQueueService } from '@logic/services';
import type { WebhookEvent } from 'types/evolution';
import { isGroupMessage } from './helpers';

export const handleMessageUpsert = async (
	update: WebhookEvent<typeof EVOLUTION_EVENTS.MESSAGES_UPSERT>
) => {
	const { data } = update;

	if (isGroupMessage(data)) {
		console.log('🚀 ~ handleMessageUpsert ~ update:', update);
		const { group } =
			(await messageService.ensureGroupMessageUpsert(data)) ?? {};

		if (group) {
			await removalQueueService.addInactiveMembersToRemovalQueue(group);
		}
	}
};
