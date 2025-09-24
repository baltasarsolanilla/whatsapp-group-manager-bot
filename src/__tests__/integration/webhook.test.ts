import request from 'supertest';
import express from 'express';
import routes from '@routes/routes';
import { errorHandler } from '@utils/errorHandler';
import { mockWebhookEvent } from '../fixtures/mockData';

// Create test app
const createTestApp = () => {
	const app = express();
	app.use(express.json());
	app.use('/', routes);
	app.use(errorHandler);
	return app;
};

describe('Webhook Integration Tests', () => {
	let app: express.Application;

	beforeEach(() => {
		app = createTestApp();
	});

	describe('POST /', () => {
		it('should accept webhook events at root path', async () => {
			const response = await request(app)
				.post('/')
				.send(mockWebhookEvent)
				.expect(200);

			expect(response.body).toEqual({});
		});

		it('should handle malformed JSON', async () => {
			const response = await request(app)
				.post('/')
				.send('invalid json')
				.set('Content-Type', 'application/json')
				.expect(500);

			expect(response.body).toHaveProperty('error');
		});

		it('should handle missing body', async () => {
			const response = await request(app).post('/').expect(200);

			// Should still process with undefined body
			expect(response.status).toBe(200);
		});
	});

	describe('POST /webhook', () => {
		it('should accept webhook events at webhook path', async () => {
			const response = await request(app)
				.post('/webhook')
				.send(mockWebhookEvent)
				.expect(200);

			expect(response.body).toEqual({});
		});

		it('should handle different event types', async () => {
			const customEvent = {
				...mockWebhookEvent,
				event: 'custom.event' as 'messages.upsert',
			};

			const response = await request(app)
				.post('/webhook')
				.send(customEvent)
				.expect(200);

			expect(response.body).toEqual({});
		});
	});

	describe('Error handling', () => {
		it('should handle internal server errors', async () => {
			// Mock an error by sending invalid data that would cause parsing issues
			const response = await request(app)
				.post('/')
				.send({ invalid: 'data structure' })
				.expect(200); // Should not fail the webhook

			expect(response.status).toBe(200);
		});
	});
});
