import { EVOLUTION_EVENTS } from '@constants/evolution';
import { handleMessageUpsert } from '@logic/botLogic';
import type { WebhookPayload } from '../types/evolution';

type HandlerMap = {
	[EVOLUTION_EVENTS.MESSAGES_UPSERT]: (
		payload: WebhookPayload<typeof EVOLUTION_EVENTS.MESSAGES_UPSERT>
	) => void;
	// add more events here later
};

export const handlers: HandlerMap = {
	[EVOLUTION_EVENTS.MESSAGES_UPSERT]: handleMessageUpsert,
};
