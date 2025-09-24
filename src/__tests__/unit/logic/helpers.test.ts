import {
	isGroupMessage,
	isPrivateMessage,
	isUserWhatsappPn,
	isUserWhatsappId,
	isGroupWhatsappId,
	formatWhatsappId,
	extractPhoneNumberFromWhatsappPn,
	sleep,
} from '@logic/helpers';
import { mockMessageUpsert, mockPrivateMessageUpsert } from '../../fixtures/mockData';

describe('Logic Helpers', () => {
	describe('isGroupMessage', () => {
		it('should return true for group message', () => {
			expect(isGroupMessage(mockMessageUpsert)).toBe(true);
		});

		it('should return false for private message', () => {
			expect(isGroupMessage(mockPrivateMessageUpsert)).toBe(false);
		});
	});

	describe('isPrivateMessage', () => {
		it('should return false for group message', () => {
			expect(isPrivateMessage(mockMessageUpsert)).toBe(false);
		});

		it('should return true for private message', () => {
			expect(isPrivateMessage(mockPrivateMessageUpsert)).toBe(true);
		});
	});

	describe('isUserWhatsappPn', () => {
		it('should return true for valid WhatsApp phone number', () => {
			expect(isUserWhatsappPn('1234567890@s.whatsapp.net')).toBe(true);
		});

		it('should return false for WhatsApp ID', () => {
			expect(isUserWhatsappPn('1234567890@lid')).toBe(false);
		});

		it('should return false for group ID', () => {
			expect(isUserWhatsappPn('1234567890-1234567890@g.us')).toBe(false);
		});
	});

	describe('isUserWhatsappId', () => {
		it('should return true for valid WhatsApp user ID', () => {
			expect(isUserWhatsappId('1234567890@lid')).toBe(true);
		});

		it('should return false for WhatsApp phone number', () => {
			expect(isUserWhatsappId('1234567890@s.whatsapp.net')).toBe(false);
		});

		it('should return false for group ID', () => {
			expect(isUserWhatsappId('1234567890-1234567890@g.us')).toBe(false);
		});
	});

	describe('isGroupWhatsappId', () => {
		it('should return true for valid group ID', () => {
			expect(isGroupWhatsappId('1234567890-1234567890@g.us')).toBe(true);
		});

		it('should return false for user phone number', () => {
			expect(isGroupWhatsappId('1234567890@s.whatsapp.net')).toBe(false);
		});

		it('should return false for user ID', () => {
			expect(isGroupWhatsappId('1234567890@lid')).toBe(false);
		});
	});

	describe('formatWhatsappId', () => {
		it('should format phone number with leading plus', () => {
			expect(formatWhatsappId('+61123456789')).toBe('61123456789@s.whatsapp.net');
		});

		it('should format phone number without leading plus', () => {
			expect(formatWhatsappId('61123456789')).toBe('61123456789@s.whatsapp.net');
		});

		it('should handle empty string', () => {
			expect(formatWhatsappId('')).toBe('@s.whatsapp.net');
		});
	});

	describe('extractPhoneNumberFromWhatsappPn', () => {
		it('should extract phone number from WhatsApp PN', () => {
			expect(extractPhoneNumberFromWhatsappPn('61123456789@s.whatsapp.net')).toBe(
				'+61123456789'
			);
		});

		it('should handle short WhatsApp PN', () => {
			expect(extractPhoneNumberFromWhatsappPn('123@s.whatsapp.net')).toBe('+123');
		});
	});

	describe('sleep', () => {
		it('should resolve after specified time', async () => {
			const start = Date.now();
			await sleep(50);
			const end = Date.now();
			expect(end - start).toBeGreaterThanOrEqual(45); // Allow some tolerance
		});

		it('should resolve immediately for 0ms', async () => {
			const start = Date.now();
			await sleep(0);
			const end = Date.now();
			expect(end - start).toBeLessThan(10);
		});
	});
});