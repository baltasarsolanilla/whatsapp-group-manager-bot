import {
	isGroupMessage,
	isPrivateMessage,
	isUserWhatsappPn,
	isUserWhatsappId,
	isGroupWhatsappId,
	formatWhatsappId,
	extractPhoneNumberFromWhatsappPn,
	sleep,
} from './helpers';
import {
	WHATSAPP_USER_PN_SUFFIX,
} from '@constants/messagesConstants';
import type { MessageUpsert } from 'types/evolution';

describe('helpers.ts', () => {
	describe('isGroupMessage', () => {
		it('should return true for group messages', () => {
			const groupMessage: MessageUpsert = {
				key: {
					remoteJid: '120363403645737238@g.us',
					fromMe: false,
					id: 'test-id',
					participant: 'test-participant',
				},
				pushName: 'Test User',
				messageType: 'conversation',
				messageTimestamp: Date.now(),
			};

			expect(isGroupMessage(groupMessage)).toBe(true);
		});

		it('should return false for private messages', () => {
			const privateMessage: MessageUpsert = {
				key: {
					remoteJid: '61476554841@s.whatsapp.net',
					fromMe: false,
					id: 'test-id',
					participant: 'test-participant',
				},
				pushName: 'Test User',
				messageType: 'conversation',
				messageTimestamp: Date.now(),
			};

			expect(isGroupMessage(privateMessage)).toBe(false);
		});

		it('should return false for user ID format', () => {
			const userIdMessage: MessageUpsert = {
				key: {
					remoteJid: '69918158549171@lid',
					fromMe: false,
					id: 'test-id',
					participant: 'test-participant',
				},
				pushName: 'Test User',
				messageType: 'conversation',
				messageTimestamp: Date.now(),
			};

			expect(isGroupMessage(userIdMessage)).toBe(false);
		});
	});

	describe('isPrivateMessage', () => {
		it('should return true for private messages', () => {
			const privateMessage: MessageUpsert = {
				key: {
					remoteJid: '61476554841@s.whatsapp.net',
					fromMe: false,
					id: 'test-id',
					participant: 'test-participant',
				},
				pushName: 'Test User',
				messageType: 'conversation',
				messageTimestamp: Date.now(),
			};

			expect(isPrivateMessage(privateMessage)).toBe(true);
		});

		it('should return false for group messages', () => {
			const groupMessage: MessageUpsert = {
				key: {
					remoteJid: '120363403645737238@g.us',
					fromMe: false,
					id: 'test-id',
					participant: 'test-participant',
				},
				pushName: 'Test User',
				messageType: 'conversation',
				messageTimestamp: Date.now(),
			};

			expect(isPrivateMessage(groupMessage)).toBe(false);
		});

		it('should return false for user ID format', () => {
			const userIdMessage: MessageUpsert = {
				key: {
					remoteJid: '69918158549171@lid',
					fromMe: false,
					id: 'test-id',
					participant: 'test-participant',
				},
				pushName: 'Test User',
				messageType: 'conversation',
				messageTimestamp: Date.now(),
			};

			expect(isPrivateMessage(userIdMessage)).toBe(false);
		});
	});

	describe('isUserWhatsappPn', () => {
		it('should return true for valid WhatsApp phone numbers', () => {
			expect(isUserWhatsappPn('61476554841@s.whatsapp.net')).toBe(true);
			expect(isUserWhatsappPn('1234567890@s.whatsapp.net')).toBe(true);
		});

		it('should return false for invalid formats', () => {
			expect(isUserWhatsappPn('120363403645737238@g.us')).toBe(false);
			expect(isUserWhatsappPn('69918158549171@lid')).toBe(false);
			expect(isUserWhatsappPn('invalid-format')).toBe(false);
			expect(isUserWhatsappPn('')).toBe(false);
		});
	});

	describe('isUserWhatsappId', () => {
		it('should return true for valid WhatsApp user IDs', () => {
			expect(isUserWhatsappId('69918158549171@lid')).toBe(true);
			expect(isUserWhatsappId('212059715313729@lid')).toBe(true);
		});

		it('should return false for invalid formats', () => {
			expect(isUserWhatsappId('61476554841@s.whatsapp.net')).toBe(false);
			expect(isUserWhatsappId('120363403645737238@g.us')).toBe(false);
			expect(isUserWhatsappId('invalid-format')).toBe(false);
			expect(isUserWhatsappId('')).toBe(false);
		});
	});

	describe('isGroupWhatsappId', () => {
		it('should return true for valid WhatsApp group IDs', () => {
			expect(isGroupWhatsappId('120363403645737238@g.us')).toBe(true);
			expect(isGroupWhatsappId('987654321@g.us')).toBe(true);
		});

		it('should return false for invalid formats', () => {
			expect(isGroupWhatsappId('61476554841@s.whatsapp.net')).toBe(false);
			expect(isGroupWhatsappId('69918158549171@lid')).toBe(false);
			expect(isGroupWhatsappId('invalid-format')).toBe(false);
			expect(isGroupWhatsappId('')).toBe(false);
		});
	});

	describe('formatWhatsappId', () => {
		it('should format phone number with leading + correctly', () => {
			expect(formatWhatsappId('+61476554841')).toBe('61476554841@s.whatsapp.net');
			expect(formatWhatsappId('+1234567890')).toBe('1234567890@s.whatsapp.net');
		});

		it('should format phone number without leading + correctly', () => {
			expect(formatWhatsappId('61476554841')).toBe('61476554841@s.whatsapp.net');
			expect(formatWhatsappId('1234567890')).toBe('1234567890@s.whatsapp.net');
		});

		it('should handle empty string', () => {
			expect(formatWhatsappId('')).toBe('@s.whatsapp.net');
		});

		it('should handle just + character', () => {
			expect(formatWhatsappId('+')).toBe('@s.whatsapp.net');
		});
	});

	describe('extractPhoneNumberFromWhatsappPn', () => {
		it('should extract phone number correctly', () => {
			expect(extractPhoneNumberFromWhatsappPn('61476554841@s.whatsapp.net')).toBe('+61476554841');
			expect(extractPhoneNumberFromWhatsappPn('1234567890@s.whatsapp.net')).toBe('+1234567890');
		});

		it('should handle edge cases', () => {
			// Empty number part
			expect(extractPhoneNumberFromWhatsappPn('@s.whatsapp.net')).toBe('+');
			
			// Just the suffix
			const suffixLength = WHATSAPP_USER_PN_SUFFIX.length;
			const testInput = 'test'.repeat(suffixLength / 4) + '@s.whatsapp.net';
			const expectedOutput = '+' + testInput.slice(0, -suffixLength);
			expect(extractPhoneNumberFromWhatsappPn(testInput)).toBe(expectedOutput);
		});
	});

	describe('sleep', () => {
		it('should resolve after specified milliseconds', async () => {
			const start = Date.now();
			const delay = 50; // 50ms for fast test
			
			await sleep(delay);
			
			const elapsed = Date.now() - start;
			// Allow some tolerance for timing (±10ms)
			expect(elapsed).toBeGreaterThanOrEqual(delay - 10);
			expect(elapsed).toBeLessThan(delay + 50); // More generous upper bound
		});

		it('should return a Promise', () => {
			const result = sleep(1);
			expect(result).toBeInstanceOf(Promise);
			return result; // Return to ensure Jest waits for it
		});

		it('should work with 0 milliseconds', async () => {
			const start = Date.now();
			await sleep(0);
			const elapsed = Date.now() - start;
			// Should complete very quickly, within reasonable bounds
			expect(elapsed).toBeLessThan(10);
		});
	});
});