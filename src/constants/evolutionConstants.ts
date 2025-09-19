export const EVOLUTION_EVENTS = {
	MESSAGES_UPSERT: 'messages.upsert',
	MESSAGES_UPDATE: 'messages.update',
	MESSAGES_DELETE: 'messages.delete',
	CONNECTION_UPDATE: 'connection.update',
	PRESENCE_UPDATE: 'presence.update',
	// ... all other events
} as const;

export const GroupAction = {
	REMOVE: 'remove',
	ADD: 'add',
	PROMOTE: 'promote',
	DEMOTE: 'demote',
} as const;

export const MessageType = {
	CONVERSATION: 'conversation',
	REACTION: 'reactionMessage',
	IMAGE: 'imageMessage',
	CONTACT: 'contactMessage',
	POLL: 'pollCreationMessageV3',
} as const;

export const EvolutionIntegration = {
	WHATSAPP_BAILEYS: 'WHATSAPP-BAILEYS',
	WHATSAPP_BUSINESS: 'WHATSAPP-BUSINESS',
} as const;
