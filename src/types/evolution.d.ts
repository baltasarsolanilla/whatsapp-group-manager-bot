// Starter TypeScript types for Evolution API v2
import { EVOLUTION_EVENTS } from 'constants/evolution';

export type EvolutionIntegration = 'WHATSAPP-BAILEYS' | 'WHATSAPP-BUSINESS';
export type MessageType = 'conversation' | 'messageReaction';

// -------------------------------
// Messaging
// -------------------------------
export type SendTextRequest = {
	number: string;
	text: string;
};

export type messageStatus = 'PENDING' | 'SENT' | 'FAILED';

export type SendTextResponse = {
	key: {
		remoteJid: string;
		fromMe: boolean;
		id: string;
	};
	message: {
		extendedTextMessage: {
			text: string;
		};
	};
	messageTimestamp: string;
	status: messageStatus;
};

// -------------------------------
// Webhook events
// -------------------------------

export type MessageUpsert = {
	key: {
		remoteJid: string;
		fromMe: boolean;
		id: string;
		participant: string;
		participantPn?: string;
	};
	pushName: string;
	messageType: MessageType;
};

export type EvolutionEvent =
	(typeof EVOLUTION_EVENTS)[keyof typeof EVOLUTION_EVENTS];

export type EvolutionData = {
	remoteJid: string;
};

export type WebhookPayloadMap = {
	[EVOLUTION_EVENTS.MESSAGES_UPSERT]: MessageUpsert;
	// add more events here
};

export type WebhookPayload<
	T extends keyof WebhookPayloadMap = keyof WebhookPayloadMap,
> = {
	event: T;
	instanceId: string;
	data: WebhookPayloadMap[T];
};
