import { EVOLUTION_EVENTS } from '@constants/evolutionConstants';
import { handleMessageUpsert, handleGroupParticipantsUpdate } from '@logic/botLogic';
import type { WebhookEvent } from 'types/evolution';

type HandlerMap = {
	[EVOLUTION_EVENTS.MESSAGES_UPSERT]: (
		payload: WebhookEvent<typeof EVOLUTION_EVENTS.MESSAGES_UPSERT>
	) => void;
	[EVOLUTION_EVENTS.GROUP_PARTICIPANTS_UPDATE]: (
		payload: WebhookEvent<typeof EVOLUTION_EVENTS.GROUP_PARTICIPANTS_UPDATE>
	) => void;
	// add more events here later
};

export const handlers: HandlerMap = {
	[EVOLUTION_EVENTS.MESSAGES_UPSERT]: handleMessageUpsert,
	[EVOLUTION_EVENTS.GROUP_PARTICIPANTS_UPDATE]: handleGroupParticipantsUpdate,
};
