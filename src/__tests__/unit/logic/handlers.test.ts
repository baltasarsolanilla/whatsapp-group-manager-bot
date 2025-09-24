import { EVOLUTION_EVENTS } from '@constants/evolutionConstants';
import { mockWebhookEvent } from '../../fixtures/mockData';

// Mock the bot logic
jest.mock('@logic/botLogic', () => ({
	handleMessageUpsert: jest.fn(),
}));

describe('Handlers', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('handlers object', () => {
		it('should have the correct event handlers mapped', async () => {
			// Dynamically import to avoid compilation issues
			const { handlers } = await import('@logic/handlers');
			expect(handlers).toHaveProperty(EVOLUTION_EVENTS.MESSAGES_UPSERT);
		});

		it('should contain all expected handlers', async () => {
			const { handlers } = await import('@logic/handlers');
			const expectedHandlers = [EVOLUTION_EVENTS.MESSAGES_UPSERT];
			
			expectedHandlers.forEach(event => {
				expect(handlers).toHaveProperty(event);
			});
		});
	});

	describe('handler execution', () => {
		it('should call handleMessageUpsert for messages.upsert event', async () => {
			const { handlers } = await import('@logic/handlers');
			const { handleMessageUpsert } = await import('@logic/botLogic');
			
			const handler = handlers[EVOLUTION_EVENTS.MESSAGES_UPSERT];
			handler(mockWebhookEvent);

			expect(handleMessageUpsert).toHaveBeenCalledWith(mockWebhookEvent);
			expect(handleMessageUpsert).toHaveBeenCalledTimes(1);
		});
	});
});