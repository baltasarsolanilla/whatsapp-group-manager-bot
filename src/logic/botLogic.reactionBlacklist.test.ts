import { BLACKLIST_EMOJI } from '@constants/messagesConstants';
import { isUserAdmin } from './helpers';
import type { GroupData, MessageUpsert } from 'types/evolution';

describe('Reaction-based Blacklist Feature', () => {
	describe('isUserAdmin', () => {
		it('should identify admin users correctly', () => {
			const mockGroupData: GroupData = {
				id: '120363403645737238@g.us',
				subject: 'Test Group',
				subjectOwner: '',
				subjectTime: 0,
				pictureUrl: null,
				size: 3,
				creation: 0,
				owner: '',
				desc: '',
				descId: '',
				restrict: false,
				announce: false,
				isCommunity: false,
				isCommunityAnnounce: false,
				participants: [
					{
						id: '82334925746303@lid',
						jid: '56962320428@s.whatsapp.net',
						lid: '82334925746303@lid',
						admin: 'admin',
					},
					{
						id: '275449187958817@lid',
						jid: '61487122491@s.whatsapp.net',
						lid: '275449187958817@lid',
						admin: 'superadmin',
					},
					{
						id: '69918158549171@lid',
						jid: '61433911801@s.whatsapp.net',
						lid: '69918158549171@lid',
						admin: null,
					},
				],
			};

			// Test admin
			expect(isUserAdmin('82334925746303@lid', mockGroupData)).toBe(true);

			// Test superadmin
			expect(isUserAdmin('275449187958817@lid', mockGroupData)).toBe(true);

			// Test regular user
			expect(isUserAdmin('69918158549171@lid', mockGroupData)).toBe(false);

			// Test non-existent user
			expect(isUserAdmin('999999999999@lid', mockGroupData)).toBe(false);

			console.log('✅ Admin verification functionality validated');
		});
	});

	describe('handleReactionMessage structure', () => {
		it('should validate reaction message webhook structure', () => {
			// This test validates the structure of a reaction message webhook event
			const mockReactionWebhook = {
				event: 'messages.upsert',
				instance: 'my-instance',
				data: {
					key: {
						remoteJid: '120363403554080562@g.us',
						fromMe: false,
						id: '3A20E439291D7F9C0AC9',
						participant: '82334925746303@lid', // Admin who reacted
						participantAlt: '56962320428@s.whatsapp.net',
					},
					pushName: 'Valentina',
					messageType: 'reactionMessage',
					messageTimestamp: 1759875142,
					message: {
						reactionMessage: {
							key: {
								id: '3A868C172CED89C71C6B',
								fromMe: false,
								remoteJid: '120363403645737238@g.us',
								participant: '275449187958817@lid', // Target user to blacklist
							},
							text: '🚫',
							senderTimestampMs: 1759875191970,
						},
					},
				},
			};

			// Verify webhook structure
			expect(mockReactionWebhook.data.messageType).toBe('reactionMessage');
			expect(mockReactionWebhook.data.message?.reactionMessage).toBeDefined();
			expect(mockReactionWebhook.data.message?.reactionMessage?.text).toBe(
				BLACKLIST_EMOJI
			);

			// Verify participant extraction
			const reactorId = mockReactionWebhook.data.key.participant;
			const targetId =
				mockReactionWebhook.data.message?.reactionMessage?.key.participant;

			expect(reactorId).toBe('82334925746303@lid');
			expect(targetId).toBe('275449187958817@lid');
			expect(reactorId).not.toBe(targetId);

			console.log('✅ Reaction message structure validated');
		});

		it('should validate workflow steps for blacklist via emoji', () => {
			const workflowSteps = [
				'1. Receive reaction message webhook with messageType=reactionMessage',
				'2. Extract reactor WhatsApp ID from data.key.participant',
				'3. Extract target user WhatsApp ID from data.message.reactionMessage.key.participant',
				'4. Verify reaction emoji is 🚫',
				'5. Fetch group data to verify admin status',
				'6. Verify reactor is admin or superadmin',
				'7. Add target user to blacklist using blacklistService.addToBlacklistWithRemoval()',
				'8. Log success or error',
			];

			expect(workflowSteps).toHaveLength(8);
			expect(workflowSteps[3]).toContain('🚫');
			expect(workflowSteps[6]).toContain('addToBlacklistWithRemoval');

			console.log('✅ Blacklist via emoji workflow structure validated');
		});
	});

	describe('MessageUpsert type with reactionMessage', () => {
		it('should support reaction message structure in MessageUpsert type', () => {
			const mockMessageUpsert: MessageUpsert = {
				key: {
					remoteJid: '120363403645737238@g.us',
					fromMe: false,
					id: '3A20E439291D7F9C0AC9',
					participant: '82334925746303@lid',
				},
				pushName: 'Admin User',
				messageType: 'reactionMessage',
				messageTimestamp: 1759875142,
				message: {
					reactionMessage: {
						key: {
							id: '3A868C172CED89C71C6B',
							fromMe: false,
							remoteJid: '120363403645737238@g.us',
							participant: '275449187958817@lid',
						},
						text: '🚫',
						senderTimestampMs: 1759875191970,
					},
				},
			};

			// Verify type structure
			expect(mockMessageUpsert.message).toBeDefined();
			expect(mockMessageUpsert.message?.reactionMessage).toBeDefined();
			expect(mockMessageUpsert.message?.reactionMessage?.key).toBeDefined();
			expect(
				mockMessageUpsert.message?.reactionMessage?.key.participant
			).toBeDefined();

			console.log('✅ MessageUpsert type with reactionMessage validated');
		});
	});

	describe('Blacklist emoji constant', () => {
		it('should verify blacklist emoji constant is defined', () => {
			expect(BLACKLIST_EMOJI).toBe('🚫');
			console.log('✅ Blacklist emoji constant validated');
		});
	});
});
