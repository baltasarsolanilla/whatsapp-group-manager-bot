// Starter TypeScript types for Evolution API v2
import {
	EVOLUTION_EVENTS,
	EvolutionIntegration,
	GroupAction,
	MessageType,
} from '@constants/evolutionConstants';

export type EvolutionIntegrationType =
	(typeof EvolutionIntegration)[keyof typeof EvolutionIntegration];
export type MessageType = (typeof MessageType)[keyof typeof MessageType];
export type GroupActionType = (typeof GroupAction)[keyof typeof GroupAction];

// -------------------------------
// Messaging
// -------------------------------
export type SendTextRequest = {
	number: string;
	text: string;
};

export type RemoveMembersRequest = {
	action: GroupActionType;
	participants: string[];
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
	messageTimestamp: number;
};

export type EvolutionEvent =
	(typeof EVOLUTION_EVENTS)[keyof typeof EVOLUTION_EVENTS];

export type EvolutionData = {
	remoteJid: string;
};

export type WebhookEventMap = {
	[EVOLUTION_EVENTS.MESSAGES_UPSERT]: MessageUpsert;
	// add more events here
};

export type WebhookEvent<
	T extends keyof WebhookEventMap = keyof WebhookEventMap,
> = {
	event: T;
	instance: string;
	data: WebhookEventMap[T];
	date_time: string;
};

// -------------------------------
// Group info
// -------------------------------
export type GroupParticipant = {
	id: string; // whatsappUserId
	jid: string; // whatsappPn
	lid: string;
	admin: string | null;
};

export type GroupData = {
	id: string; // whatsappGroupId
	subject: string; // whatsapp group name
	subjectOwner: string;
	subjectTime: number;
	pictureUrl: string | null;
	size: number;
	creation: number;
	owner: string;
	desc: string; // Whatsapp group description
	descId: string;
	restrict: boolean;
	announce: boolean;
	participants: GroupParticipant[];
	isCommunity: boolean;
	isCommunityAnnounce: boolean;
};
