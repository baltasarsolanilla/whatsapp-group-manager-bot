import type { WebhookEvent, MessageUpsert } from 'types/evolution';
import { EVOLUTION_EVENTS, MessageType } from '@constants/evolutionConstants';

export const mockWebhookEvent: WebhookEvent<'messages.upsert'> = {
	event: EVOLUTION_EVENTS.MESSAGES_UPSERT,
	instance: 'test-instance',
	date_time: '2024-01-01T00:00:00.000Z',
	data: {
		key: {
			remoteJid: '1234567890-1234567890@g.us',
			fromMe: false,
			id: 'msg-123',
			participant: '1234567890@lid',
			participantPn: '1234567890@s.whatsapp.net',
		},
		pushName: 'Test User',
		messageType: MessageType.CONVERSATION,
		messageTimestamp: 1704067200000,
	},
};

export const mockMessageUpsert: MessageUpsert = {
	key: {
		remoteJid: '1234567890-1234567890@g.us',
		fromMe: false,
		id: 'msg-123',
		participant: '1234567890@lid',
		participantPn: '1234567890@s.whatsapp.net',
	},
	pushName: 'Test User',
	messageType: MessageType.CONVERSATION,
	messageTimestamp: 1704067200000,
};

export const mockPrivateMessageUpsert: MessageUpsert = {
	key: {
		remoteJid: '1234567890@s.whatsapp.net',
		fromMe: false,
		id: 'msg-456',
		participant: '1234567890@lid',
		participantPn: '1234567890@s.whatsapp.net',
	},
	pushName: 'Private User',
	messageType: MessageType.CONVERSATION,
	messageTimestamp: 1704067200000,
};

export const mockGroupData = {
	id: '1234567890-1234567890@g.us',
	subject: 'Test Group',
	subjectOwner: '1234567890@s.whatsapp.net',
	subjectTime: 1704067200,
	pictureUrl: null,
	size: 5,
	creation: 1704067200,
	owner: '1234567890@s.whatsapp.net',
	desc: 'Test group description',
	descId: 'desc-123',
	restrict: false,
	announce: false,
	participants: [
		{
			id: '1234567890@lid',
			jid: '1234567890@s.whatsapp.net',
			lid: '1234567890@lid',
			admin: 'admin',
		},
		{
			id: '0987654321@lid',
			jid: '0987654321@s.whatsapp.net',
			lid: '0987654321@lid',
			admin: null,
		},
	],
	isCommunity: false,
	isCommunityAnnounce: false,
};

export const mockUser = {
	id: 'user-123',
	whatsappId: '1234567890@lid',
	whatsappPn: '1234567890@s.whatsapp.net',
	name: 'Test User',
	createdAt: new Date('2024-01-01T00:00:00.000Z'),
};

export const mockGroup = {
	id: 'group-123',
	whatsappId: '1234567890-1234567890@g.us',
	name: 'Test Group',
	inactivityThresholdMinutes: 43200,
	createdAt: new Date('2024-01-01T00:00:00.000Z'),
};

export const mockMessage = {
	id: 'message-123',
	whatsappId: 'msg-123',
	userId: 'user-123',
	groupId: 'group-123',
	messageType: 'conversation',
	date: new Date('2024-01-01T00:00:00.000Z'),
	createdAt: new Date('2024-01-01T00:00:00.000Z'),
};
