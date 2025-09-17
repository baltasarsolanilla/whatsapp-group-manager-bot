import type { MessageUpsert, WebhookEvent } from 'types/evolution';

// ============================================================================
// USER
// ============================================================================

export const userMapper = {
	id: (payload: MessageUpsert) => payload.key.participant,
	pn: (payload: MessageUpsert) => payload.key.participantPn ?? undefined,
	name: (payload: MessageUpsert) => payload.pushName,
};

// ============================================================================
// GROUP
// ============================================================================

export const groupMapper = {
	id: (payload: MessageUpsert) => payload.key.remoteJid,
};

// ============================================================================
// MESSAGE
// ============================================================================

export const messageMapper = {
	id: (payload: MessageUpsert) => payload.key.id,
	type: (payload: MessageUpsert) => payload.messageType,
	timestamp: (payload: MessageUpsert) => payload.messageTimestamp,
};

// ============================================================================
// WEBHOOK_EVENT
// ============================================================================

export const webhookEventMapper = {
	event: (payload: WebhookEvent) => payload.event,
	instance: (payload: WebhookEvent) => payload.instance,
	data: (payload: WebhookEvent) => payload.data,
	date: (payload: WebhookEvent) => payload.date_time,
};
