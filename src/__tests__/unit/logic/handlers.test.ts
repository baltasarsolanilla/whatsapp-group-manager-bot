import { EVOLUTION_EVENTS } from '@constants/evolutionConstants';
import { mockWebhookEvent } from '../../fixtures/mockData';

// Mock the bot logic
const mockHandleMessageUpsert = jest.fn();
jest.mock('@logic/botLogic', () => ({
	handleMessageUpsert: mockHandleMessageUpsert,
}));

describe('Handlers', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('handlers object structure', () => {
		it('should export handlers object with expected properties', async () => {
			// Dynamically import to avoid compilation issues
			const { handlers } = await import('@logic/handlers');
			expect(typeof handlers).toBe('object');
			expect(handlers).not.toBeNull();
		});
	});

	describe('handler execution', () => {
		it('should have messages.upsert handler', async () => {
			const { handlers } = await import('@logic/handlers');
			const eventKey = EVOLUTION_EVENTS.MESSAGES_UPSERT;
			
			// Check if the handler exists and is a function
			expect(handlers).toHaveProperty(eventKey);
			expect(typeof handlers[eventKey]).toBe('function');
		});

		it('should call handleMessageUpsert when handler is executed', async () => {
			const { handlers } = await import('@logic/handlers');
			const handler = handlers[EVOLUTION_EVENTS.MESSAGES_UPSERT];
			
			if (handler) {
				handler(mockWebhookEvent);
				expect(mockHandleMessageUpsert).toHaveBeenCalledWith(mockWebhookEvent);
			}
		});
	});
});