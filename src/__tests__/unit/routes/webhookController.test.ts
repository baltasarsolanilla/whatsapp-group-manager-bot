import { webhookController } from '@routes/webhookController';
import { handlers } from '@logic/handlers';
import { webhookEventService } from '@logic/services';
import { Request, Response } from 'express';
import { mockWebhookEvent } from '../../fixtures/mockData';

// Mock dependencies
jest.mock('@logic/handlers');
jest.mock('@logic/services');

const mockedHandlers = handlers as jest.Mocked<typeof handlers>;
const mockedWebhookEventService = webhookEventService as jest.Mocked<typeof webhookEventService>;

describe('Webhook Controller', () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockJson: jest.Mock;
	let mockStatus: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		
		mockJson = jest.fn();
		mockStatus = jest.fn().mockReturnValue({ json: mockJson });
		
		mockReq = {
			body: mockWebhookEvent,
		};
		
		mockRes = {
			status: mockStatus,
			json: mockJson,
		};

		mockedWebhookEventService.storeEvent = jest.fn();
	});

	it('should store webhook event and call appropriate handler', async () => {
		const mockHandler = jest.fn();
		mockedHandlers[mockWebhookEvent.event] = mockHandler;

		await webhookController(mockReq as Request, mockRes as Response, jest.fn());

		expect(mockedWebhookEventService.storeEvent).toHaveBeenCalledWith(mockWebhookEvent);
		expect(mockHandler).toHaveBeenCalledWith(mockWebhookEvent);
		expect(mockStatus).toHaveBeenCalledWith(200);
		expect(mockJson).toHaveBeenCalledWith(undefined);
	});

	it('should handle unknown events gracefully', async () => {
		const unknownEvent = {
			...mockWebhookEvent,
			event: 'unknown.event' as any,
		};

		mockReq.body = unknownEvent;

		await webhookController(mockReq as Request, mockRes as Response, jest.fn());

		expect(mockedWebhookEventService.storeEvent).toHaveBeenCalledWith(unknownEvent);
		expect(console.warn).toHaveBeenCalledWith('Unknown event received', unknownEvent);
		expect(mockStatus).toHaveBeenCalledWith(200);
	});

	it('should store event even if handler fails', async () => {
		const mockHandler = jest.fn().mockRejectedValue(new Error('Handler error'));
		mockedHandlers[mockWebhookEvent.event] = mockHandler;

		// The webhook controller should still complete successfully
		await webhookController(mockReq as Request, mockRes as Response, jest.fn());

		expect(mockedWebhookEventService.storeEvent).toHaveBeenCalledWith(mockWebhookEvent);
		expect(mockHandler).toHaveBeenCalledWith(mockWebhookEvent);
		expect(mockStatus).toHaveBeenCalledWith(200);
	});

	it('should handle service store error', async () => {
		const storeError = new Error('Database connection failed');
		mockedWebhookEventService.storeEvent.mockRejectedValue(storeError);

		await expect(
			webhookController(mockReq as Request, mockRes as Response, jest.fn())
		).rejects.toThrow(storeError);

		expect(mockedWebhookEventService.storeEvent).toHaveBeenCalledWith(mockWebhookEvent);
	});
});