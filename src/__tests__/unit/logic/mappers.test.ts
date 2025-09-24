import {
	msgUserMapper,
	msgGroupMapper,
	messageMapper,
	webhookEventMapper,
	groupMapper,
} from '@logic/mappers';
import {
	mockMessageUpsert,
	mockWebhookEvent,
	mockGroupData,
} from '../../fixtures/mockData';
import { AppError } from '@utils/AppError';

describe('Logic Mappers', () => {
	describe('msgUserMapper', () => {
		it('should extract user ID from participant', () => {
			const result = msgUserMapper.id(mockMessageUpsert);
			expect(result).toBe('1234567890@lid');
		});

		it('should extract user phone number from participantPn', () => {
			const result = msgUserMapper.pn(mockMessageUpsert);
			expect(result).toBe('1234567890@s.whatsapp.net');
		});

		it('should extract user name', () => {
			const result = msgUserMapper.name(mockMessageUpsert);
			expect(result).toBe('Test User');
		});

		it('should throw error when no valid WhatsApp ID found', () => {
			const invalidPayload = {
				...mockMessageUpsert,
				key: {
					...mockMessageUpsert.key,
					participant: 'invalid-id',
					participantLid: undefined,
				},
			};

			expect(() => msgUserMapper.id(invalidPayload)).toThrow(AppError);
			expect(() => msgUserMapper.id(invalidPayload)).toThrow(
				'Invalid WhatsApp participant'
			);
		});

		it('should return null when no valid phone number found', () => {
			const invalidPayload = {
				...mockMessageUpsert,
				key: {
					...mockMessageUpsert.key,
					participant: '1234567890@lid',
					participantPn: undefined,
				},
			};

			const result = msgUserMapper.pn(invalidPayload);
			expect(result).toBeNull();
		});
	});

	describe('msgGroupMapper', () => {
		it('should extract group ID from remoteJid', () => {
			const result = msgGroupMapper.id(mockMessageUpsert);
			expect(result).toBe('1234567890-1234567890@g.us');
		});
	});

	describe('messageMapper', () => {
		it('should extract message ID', () => {
			const result = messageMapper.id(mockMessageUpsert);
			expect(result).toBe('msg-123');
		});

		it('should extract message type', () => {
			const result = messageMapper.type(mockMessageUpsert);
			expect(result).toBe('conversation');
		});

		it('should extract message timestamp', () => {
			const result = messageMapper.timestamp(mockMessageUpsert);
			expect(result).toBe(1704067200000);
		});
	});

	describe('webhookEventMapper', () => {
		it('should extract event type', () => {
			const result = webhookEventMapper.event(mockWebhookEvent);
			expect(result).toBe('messages.upsert');
		});

		it('should extract instance', () => {
			const result = webhookEventMapper.instance(mockWebhookEvent);
			expect(result).toBe('test-instance');
		});

		it('should extract data', () => {
			const result = webhookEventMapper.data(mockWebhookEvent);
			expect(result).toEqual(mockWebhookEvent.data);
		});

		it('should extract date', () => {
			const result = webhookEventMapper.date(mockWebhookEvent);
			expect(result).toBe('2024-01-01T00:00:00.000Z');
		});
	});

	describe('groupMapper', () => {
		it('should extract group ID', () => {
			const result = groupMapper.id(mockGroupData);
			expect(result).toBe('1234567890-1234567890@g.us');
		});

		it('should extract group name', () => {
			const result = groupMapper.name(mockGroupData);
			expect(result).toBe('Test Group');
		});

		it('should extract group description', () => {
			const result = groupMapper.desc(mockGroupData);
			expect(result).toBe('Test group description');
		});

		it('should extract group size', () => {
			const result = groupMapper.size(mockGroupData);
			expect(result).toBe(5);
		});

		it('should extract participants', () => {
			const result = groupMapper.participants(mockGroupData);
			expect(result).toEqual(mockGroupData.participants);
			expect(result).toHaveLength(2);
		});
	});
});
