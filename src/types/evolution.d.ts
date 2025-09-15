// Starter TypeScript types for Evolution API v2
import { EVOLUTION_EVENTS } from 'constants/evolution';

export type EvolutionIntegration = 'WHATSAPP-BAILEYS' | 'WHATSAPP-BUSINESS';

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
	};
	message: {
		conversation?: string;
		extendedTextMessage?: {
			text: string;
		};
	};
	pushName: string;
	timestamp: number;
};

export type EvolutionEvent =
	(typeof EVOLUTION_EVENTS)[keyof typeof EVOLUTION_EVENTS];

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
