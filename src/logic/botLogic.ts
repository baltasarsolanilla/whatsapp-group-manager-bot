import { type WebhookPayload } from '../types/evolution';
import { EVOLUTION_EVENTS } from './../constants/evolution';

export const handleMessageUpsert = (
	update: WebhookPayload<typeof EVOLUTION_EVENTS.MESSAGES_UPSERT>
) => {
	console.log('Handling update from:', update.data.pushName);
};
