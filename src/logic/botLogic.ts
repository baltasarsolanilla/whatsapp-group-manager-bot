import { upsertUser } from '@database/repositories/userRepository';
import type { WebhookPayload } from '../types/evolution';
import { EVOLUTION_EVENTS } from './../constants/evolution';
import { extractUserFromUpdate } from './helpers';

export const handleMessageUpsert = (
	update: WebhookPayload<typeof EVOLUTION_EVENTS.MESSAGES_UPSERT>
) => {
	const res = extractUserFromUpdate(update.data);

	if (res) {
		upsertUser(res);
	}
};
