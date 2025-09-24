import {
	EVOLUTION_EVENTS,
	GroupAction,
	MessageType,
	EvolutionIntegration,
} from '@constants/evolutionConstants';

describe('Evolution Constants', () => {
	describe('EVOLUTION_EVENTS', () => {
		it('should have correct event names', () => {
			expect(EVOLUTION_EVENTS.MESSAGES_UPSERT).toBe('messages.upsert');
			expect(EVOLUTION_EVENTS.MESSAGES_UPDATE).toBe('messages.update');
			expect(EVOLUTION_EVENTS.MESSAGES_DELETE).toBe('messages.delete');
			expect(EVOLUTION_EVENTS.CONNECTION_UPDATE).toBe('connection.update');
			expect(EVOLUTION_EVENTS.PRESENCE_UPDATE).toBe('presence.update');
		});

		it('should be readonly', () => {
			// TypeScript should prevent modification
			expect(typeof EVOLUTION_EVENTS).toBe('object');
			expect(Object.isFrozen(EVOLUTION_EVENTS)).toBe(true);
		});
	});

	describe('GroupAction', () => {
		it('should have correct action names', () => {
			expect(GroupAction.REMOVE).toBe('remove');
			expect(GroupAction.ADD).toBe('add');
			expect(GroupAction.PROMOTE).toBe('promote');
			expect(GroupAction.DEMOTE).toBe('demote');
		});
	});

	describe('MessageType', () => {
		it('should have correct message types', () => {
			expect(MessageType.CONVERSATION).toBe('conversation');
			expect(MessageType.REACTION).toBe('reactionMessage');
			expect(MessageType.IMAGE).toBe('imageMessage');
			expect(MessageType.CONTACT).toBe('contactMessage');
			expect(MessageType.POLL).toBe('pollCreationMessageV3');
		});
	});

	describe('EvolutionIntegration', () => {
		it('should have correct integration types', () => {
			expect(EvolutionIntegration.WHATSAPP_BAILEYS).toBe('WHATSAPP-BAILEYS');
			expect(EvolutionIntegration.WHATSAPP_BUSINESS).toBe('WHATSAPP-BUSINESS');
		});
	});
});