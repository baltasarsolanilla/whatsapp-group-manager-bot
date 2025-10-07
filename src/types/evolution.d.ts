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

export type DeleteMessageRequest = {
	id: string;
	remoteJid: string;
	fromMe: boolean;
	participant: string;
};

// -------------------------------
// Blacklist API
// -------------------------------
export type AddToBlacklistRequest = {
	phoneNumber: string;
	groupId: string;
	reason?: string;
	skipRemoval?: boolean;
};

export type RemovalResult = {
	success: boolean;
	error?: string;
	groupWaId: string;
};

export type AddToBlacklistResponse = {
	message: string;
	blacklistEntry?: unknown;
	removalResults?: RemovalResult;
	skipRemoval?: boolean;
	reason?: string | null;
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
		participantLid?: string;
		participantAlt?: string;
	};
	pushName: string;
	messageType: MessageType;
	messageTimestamp: number;
};

export type GroupParticipantsUpdate = {
	id: string; // Group WhatsApp ID (e.g., "120363403645737238@g.us")
	author: string; // Author who performed the action (e.g., "212059715313729@lid")
	participants: string[]; // Array of participant WhatsApp IDs (e.g., ["69918158549171@lid"])
	action: GroupActionType; // "add" or "remove"
};

export type EvolutionEvent =
	(typeof EVOLUTION_EVENTS)[keyof typeof EVOLUTION_EVENTS];

export type EvolutionData = {
	remoteJid: string;
};

export type WebhookEventMap = {
	[EVOLUTION_EVENTS.MESSAGES_UPSERT]: MessageUpsert;
	[EVOLUTION_EVENTS.GROUP_PARTICIPANTS_UPDATE]: GroupParticipantsUpdate;
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
