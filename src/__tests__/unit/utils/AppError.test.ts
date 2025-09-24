import { AppError } from '@utils/AppError';

describe('AppError', () => {
	it('should create error with correct properties', () => {
		const message = 'Test error message';
		const statusCode = 400;
		const error = new AppError(message, statusCode);

		expect(error.message).toBe(message);
		expect(error.statusCode).toBe(statusCode);
		expect(error.status).toBe('fail');
		expect(error.isOperational).toBe(true);
		expect(error.name).toBe('AppError');
	});

	it('should set status to "error" for 5xx status codes', () => {
		const error = new AppError('Server error', 500);
		expect(error.status).toBe('error');
	});

	it('should set status to "fail" for 4xx status codes', () => {
		const error = new AppError('Client error', 404);
		expect(error.status).toBe('fail');
	});

	it('should create required error with 400 status', () => {
		const message = 'Field is required';
		const error = AppError.required(message);

		expect(error.message).toBe(message);
		expect(error.statusCode).toBe(400);
		expect(error.status).toBe('fail');
	});

	it('should create not found error with 404 status', () => {
		const message = 'Resource not found';
		const error = AppError.notFound(message);

		expect(error.message).toBe(message);
		expect(error.statusCode).toBe(404);
		expect(error.status).toBe('fail');
	});

	it('should capture stack trace', () => {
		const error = new AppError('Test error', 400);
		expect(error.stack).toBeDefined();
	});
});