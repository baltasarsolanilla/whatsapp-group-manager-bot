import { AppError } from '@utils/AppError';
import type { GroupData, MessageUpsert, WebhookEvent } from 'types/evolution';
import { isUserWhatsappPn } from './helpers';

// ============================================================================
// MSG USER
// ============================================================================

// WhatsappPn might be in "participant" or "participantPn"
const getUserWaPn = ({
	participant,
	participantPn,
}: {
	participant?: string;
	participantPn?: string;
}) => {
	for (const value of [participant, participantPn]) {
		if (value && isUserWhatsappPn(value)) {
			return value;
		}
	}

	throw AppError.notFound('Invalid WhatsApp participant');
};

// WhatsappId might be in "participant" or "participantLid"
const getUserWaId = ({
	participant,
	participantLid,
}: {
	participant?: string;
	participantLid?: string;
}) => {
	for (const value of [participant, participantLid]) {
		if (value && isUserWhatsappPn(value)) {
			return value;
		}
	}

	throw AppError.notFound('Invalid WhatsApp participant');
};

export const msgUserMapper = {
	id: (payload: MessageUpsert) => getUserWaId(payload.key),
	pn: (payload: MessageUpsert) => getUserWaPn(payload.key),
	name: (payload: MessageUpsert) => payload.pushName,
};

// ============================================================================
// MSG GROUP
// ============================================================================

export const msgGroupMapper = {
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

// ============================================================================
// GROUP
// ============================================================================

export const groupMapper = {
	id: (payload: GroupData) => payload.id,
	name: (payload: GroupData) => payload.subject,
	desc: (payload: GroupData) => payload.desc,
	size: (payload: GroupData) => payload.size,
	participants: (payload: GroupData) => payload.participants,
};
