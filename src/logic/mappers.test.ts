import {
	msgUserMapper,
	msgGroupMapper,
	messageMapper,
	webhookEventMapper,
	groupMapper,
} from './mappers';
import { AppError } from '@utils/AppError';
import type { GroupData, MessageUpsert, WebhookEvent } from 'types/evolution';

describe('mappers.ts', () => {
	describe('msgUserMapper', () => {
		describe('id', () => {
			it('should extract user WhatsApp ID from participant field', () => {
				const payload: MessageUpsert = {
					key: {
						remoteJid: '120363403645737238@g.us',
						fromMe: false,
						id: 'test-id',
						participant: '69918158549171@lid',
					},
					pushName: 'Test User',
					messageType: 'conversation',
					messageTimestamp: Date.now(),
				};

				expect(msgUserMapper.id(payload)).toBe('69918158549171@lid');
			});

			it('should extract user WhatsApp ID from participantLid field', () => {
				const payload: MessageUpsert = {
					key: {
						remoteJid: '120363403645737238@g.us',
						fromMe: false,
						id: 'test-id',
						participant: 'invalid-format',
						participantLid: '212059715313729@lid',
					},
					pushName: 'Test User',
					messageType: 'conversation',
					messageTimestamp: Date.now(),
				};

				expect(msgUserMapper.id(payload)).toBe('212059715313729@lid');
			});

			it('should throw error when no valid WhatsApp ID found', () => {
				const payload: MessageUpsert = {
					key: {
						remoteJid: '120363403645737238@g.us',
						fromMe: false,
						id: 'test-id',
						participant: 'invalid-format',
					},
					pushName: 'Test User',
					messageType: 'conversation',
					messageTimestamp: Date.now(),
				};

				expect(() => msgUserMapper.id(payload)).toThrow(AppError);
				expect(() => msgUserMapper.id(payload)).toThrow(
					'Invalid WhatsApp participant'
				);
			});

			it('should prefer participant over participantLid when both are valid', () => {
				const payload: MessageUpsert = {
					key: {
						remoteJid: '120363403645737238@g.us',
						fromMe: false,
						id: 'test-id',
						participant: '69918158549171@lid',
						participantLid: '212059715313729@lid',
					},
					pushName: 'Test User',
					messageType: 'conversation',
					messageTimestamp: Date.now(),
				};

				expect(msgUserMapper.id(payload)).toBe('69918158549171@lid');
			});
		});

		describe('pn', () => {
			it('should extract WhatsApp phone number from participant field', () => {
				const payload: MessageUpsert = {
					key: {
						remoteJid: '120363403645737238@g.us',
						fromMe: false,
						id: 'test-id',
						participant: '61476554841@s.whatsapp.net',
					},
					pushName: 'Test User',
					messageType: 'conversation',
					messageTimestamp: Date.now(),
				};

				expect(msgUserMapper.pn(payload)).toBe('61476554841@s.whatsapp.net');
			});

			it('should extract WhatsApp phone number from participantPn field', () => {
				const payload: MessageUpsert = {
					key: {
						remoteJid: '120363403645737238@g.us',
						fromMe: false,
						id: 'test-id',
						participant: 'invalid-format',
						participantPn: '1234567890@s.whatsapp.net',
					},
					pushName: 'Test User',
					messageType: 'conversation',
					messageTimestamp: Date.now(),
				};

				expect(msgUserMapper.pn(payload)).toBe('1234567890@s.whatsapp.net');
			});

			it('should extract WhatsApp phone number from participantAlt field', () => {
				const payload: MessageUpsert = {
					key: {
						remoteJid: '120363403645737238@g.us',
						fromMe: false,
						id: 'test-id',
						participant: '27702639739079@lid',
						participantAlt: '61487122491@s.whatsapp.net',
					},
					pushName: 'Vicky',
					messageType: 'reactionMessage',
					messageTimestamp: Date.now(),
				};

				expect(msgUserMapper.pn(payload)).toBe('61487122491@s.whatsapp.net');
			});
			it('should return null when no valid WhatsApp phone number found', () => {
				const payload: MessageUpsert = {
					key: {
						remoteJid: '120363403645737238@g.us',
						fromMe: false,
						id: 'test-id',
						participant: 'invalid-format',
					},
					pushName: 'Test User',
					messageType: 'conversation',
					messageTimestamp: Date.now(),
				};

				expect(msgUserMapper.pn(payload)).toBeNull();
			});

			it('should prefer participant over participantPn when both are valid', () => {
				const payload: MessageUpsert = {
					key: {
						remoteJid: '120363403645737238@g.us',
						fromMe: false,
						id: 'test-id',
						participant: '61476554841@s.whatsapp.net',
						participantPn: '1234567890@s.whatsapp.net',
					},
					pushName: 'Test User',
					messageType: 'conversation',
					messageTimestamp: Date.now(),
				};

				expect(msgUserMapper.pn(payload)).toBe('61476554841@s.whatsapp.net');
			});
		});

		describe('name', () => {
			it('should extract push name', () => {
				const payload: MessageUpsert = {
					key: {
						remoteJid: '120363403645737238@g.us',
						fromMe: false,
						id: 'test-id',
						participant: '69918158549171@lid',
					},
					pushName: 'John Doe',
					messageType: 'conversation',
					messageTimestamp: Date.now(),
				};

				expect(msgUserMapper.name(payload)).toBe('John Doe');
			});

			it('should handle undefined push name', () => {
				const payload: MessageUpsert = {
					key: {
						remoteJid: '120363403645737238@g.us',
						fromMe: false,
						id: 'test-id',
						participant: '69918158549171@lid',
					},
					pushName: undefined as unknown as string,
					messageType: 'conversation',
					messageTimestamp: Date.now(),
				};

				expect(msgUserMapper.name(payload)).toBeUndefined();
			});
		});
	});

	describe('msgGroupMapper', () => {
		describe('id', () => {
			it('should extract remote JID', () => {
				const payload: MessageUpsert = {
					key: {
						remoteJid: '120363403645737238@g.us',
						fromMe: false,
						id: 'test-id',
						participant: '69918158549171@lid',
					},
					pushName: 'Test User',
					messageType: 'conversation',
					messageTimestamp: Date.now(),
				};

				expect(msgGroupMapper.id(payload)).toBe('120363403645737238@g.us');
			});

			it('should work with private message JID', () => {
				const payload: MessageUpsert = {
					key: {
						remoteJid: '61476554841@s.whatsapp.net',
						fromMe: false,
						id: 'test-id',
						participant: '69918158549171@lid',
					},
					pushName: 'Test User',
					messageType: 'conversation',
					messageTimestamp: Date.now(),
				};

				expect(msgGroupMapper.id(payload)).toBe('61476554841@s.whatsapp.net');
			});
		});
	});

	describe('messageMapper', () => {
		const basePayload: MessageUpsert = {
			key: {
				remoteJid: '120363403645737238@g.us',
				fromMe: false,
				id: 'message-id-123',
				participant: '69918158549171@lid',
			},
			pushName: 'Test User',
			messageType: 'conversation',
			messageTimestamp: 1633024800000,
		};

		describe('id', () => {
			it('should extract message ID', () => {
				expect(messageMapper.id(basePayload)).toBe('message-id-123');
			});
		});

		describe('type', () => {
			it('should extract message type', () => {
				expect(messageMapper.type(basePayload)).toBe('conversation');
			});

			it('should handle different message types', () => {
				const imagePayload = {
					...basePayload,
					messageType: 'imageMessage' as const,
				};
				expect(messageMapper.type(imagePayload)).toBe('imageMessage');
			});
		});

		describe('timestamp', () => {
			it('should extract message timestamp', () => {
				expect(messageMapper.timestamp(basePayload)).toBe(1633024800000);
			});
		});
	});

	describe('webhookEventMapper', () => {
		const baseWebhookEvent: WebhookEvent = {
			event: 'group-participants.update',
			instance: 'my-instance',
			data: {
				id: '120363403645737238@g.us',
				author: '212059715313729@lid',
				participants: ['69918158549171@lid'],
				action: 'add',
			},
			date_time: '2025-09-20T21:08:17.846Z',
		};

		describe('event', () => {
			it('should extract event type', () => {
				expect(webhookEventMapper.event(baseWebhookEvent)).toBe(
					'group-participants.update'
				);
			});
		});

		describe('instance', () => {
			it('should extract instance', () => {
				expect(webhookEventMapper.instance(baseWebhookEvent)).toBe(
					'my-instance'
				);
			});
		});

		describe('data', () => {
			it('should extract data object', () => {
				const expectedData = {
					id: '120363403645737238@g.us',
					author: '212059715313729@lid',
					participants: ['69918158549171@lid'],
					action: 'add',
				};
				expect(webhookEventMapper.data(baseWebhookEvent)).toEqual(expectedData);
			});
		});

		describe('date', () => {
			it('should extract date_time', () => {
				expect(webhookEventMapper.date(baseWebhookEvent)).toBe(
					'2025-09-20T21:08:17.846Z'
				);
			});
		});
	});

	describe('groupMapper', () => {
		const baseGroupData: GroupData = {
			id: '120363403645737238@g.us',
			subject: 'Test Group',
			subjectOwner: 'owner@lid',
			subjectTime: 1633024800000,
			pictureUrl: 'https://example.com/picture.jpg',
			size: 5,
			creation: 1633024700000,
			owner: 'owner@lid',
			desc: 'Test group description',
			descId: 'desc-id-123',
			restrict: false,
			announce: true,
			participants: [
				{
					id: 'user1@lid',
					jid: 'user1@s.whatsapp.net',
					lid: 'user1@lid',
					admin: null,
				},
			],
			isCommunity: false,
			isCommunityAnnounce: false,
		};

		describe('id', () => {
			it('should extract group ID', () => {
				expect(groupMapper.id(baseGroupData)).toBe('120363403645737238@g.us');
			});
		});

		describe('name', () => {
			it('should extract subject as name', () => {
				expect(groupMapper.name(baseGroupData)).toBe('Test Group');
			});
		});

		describe('desc', () => {
			it('should extract description', () => {
				expect(groupMapper.desc(baseGroupData)).toBe('Test group description');
			});

			it('should handle empty description', () => {
				const groupWithEmptyDesc = { ...baseGroupData, desc: '' };
				expect(groupMapper.desc(groupWithEmptyDesc)).toBe('');
			});
		});

		describe('size', () => {
			it('should extract group size', () => {
				expect(groupMapper.size(baseGroupData)).toBe(5);
			});
		});

		describe('participants', () => {
			it('should extract participants array', () => {
				const expectedParticipants = [
					{
						id: 'user1@lid',
						jid: 'user1@s.whatsapp.net',
						lid: 'user1@lid',
						admin: null,
					},
				];
				expect(groupMapper.participants(baseGroupData)).toEqual(
					expectedParticipants
				);
			});

			it('should handle empty participants array', () => {
				const groupWithNoParticipants = { ...baseGroupData, participants: [] };
				expect(groupMapper.participants(groupWithNoParticipants)).toEqual([]);
			});
		});
	});
});
