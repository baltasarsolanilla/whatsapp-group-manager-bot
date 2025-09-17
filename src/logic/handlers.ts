import { EVOLUTION_EVENTS } from '@constants/evolutionConstants';
import { handleMessageUpsert } from '@logic/botLogic';
import type { WebhookEvent } from '../types/evolution';

type HandlerMap = {
	[EVOLUTION_EVENTS.MESSAGES_UPSERT]: (
		payload: WebhookEvent<typeof EVOLUTION_EVENTS.MESSAGES_UPSERT>
	) => void;
	// add more events here later
};

export const handlers: HandlerMap = {
	[EVOLUTION_EVENTS.MESSAGES_UPSERT]: handleMessageUpsert,
};
