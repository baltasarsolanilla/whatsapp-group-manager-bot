/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppError } from './AppError';

describe('AppError', () => {
	describe('constructor', () => {
		it('should create an AppError instance with correct properties', () => {
			const message = 'Test error message';
			const statusCode = 400;
			const error = new AppError(message, statusCode);

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AppError);
			expect(error.message).toBe(message);
			expect(error.statusCode).toBe(statusCode);
			expect(error.status).toBe('fail'); // 400 starts with '4'
			expect(error.isOperational).toBe(true);
			expect(error.name).toBe('AppError');
			expect(error.stack).toBeDefined();
		});

		it('should set status to "fail" for 4xx status codes', () => {
			const error400 = new AppError('Bad Request', 400);
			const error404 = new AppError('Not Found', 404);
			const error422 = new AppError('Unprocessable Entity', 422);

			expect(error400.status).toBe('fail');
			expect(error404.status).toBe('fail');
			expect(error422.status).toBe('fail');
		});

		it('should set status to "error" for 5xx status codes', () => {
			const error500 = new AppError('Internal Server Error', 500);
			const error502 = new AppError('Bad Gateway', 502);

			expect(error500.status).toBe('error');
			expect(error502.status).toBe('error');
		});

		it('should set status to "error" for other status codes', () => {
			const error200 = new AppError('OK', 200);
			const error300 = new AppError('Redirect', 300);

			expect(error200.status).toBe('error');
			expect(error300.status).toBe('error');
		});

		it('should capture stack trace', () => {
			const error = new AppError('Test', 400);
			expect(error.stack).toBeDefined();
			expect(error.stack).toContain('AppError.test.ts');
		});
	});

	describe('static factory methods', () => {
		describe('required', () => {
			it('should create AppError with 400 status code', () => {
				const message = 'Field is required';
				const error = AppError.required(message);

				expect(error).toBeInstanceOf(AppError);
				expect(error.message).toBe(message);
				expect(error.statusCode).toBe(400);
				expect(error.status).toBe('fail');
				expect(error.isOperational).toBe(true);
			});

			it('should handle empty message', () => {
				const error = AppError.required('');

				expect(error.message).toBe('');
				expect(error.statusCode).toBe(400);
			});

			it('should handle special characters in message', () => {
				const message = 'Field with special chars: !@#$%^&*()';
				const error = AppError.required(message);

				expect(error.message).toBe(message);
				expect(error.statusCode).toBe(400);
			});
		});

		describe('notFound', () => {
			it('should create AppError with 404 status code', () => {
				const message = 'Resource not found';
				const error = AppError.notFound(message);

				expect(error).toBeInstanceOf(AppError);
				expect(error.message).toBe(message);
				expect(error.statusCode).toBe(404);
				expect(error.status).toBe('fail');
				expect(error.isOperational).toBe(true);
			});

			it('should handle empty message', () => {
				const error = AppError.notFound('');

				expect(error.message).toBe('');
				expect(error.statusCode).toBe(404);
			});

			it('should handle long message', () => {
				const longMessage = 'A'.repeat(1000);
				const error = AppError.notFound(longMessage);

				expect(error.message).toBe(longMessage);
				expect(error.statusCode).toBe(404);
			});
		});
	});

	describe('inheritance behavior', () => {
		it('should properly inherit from Error', () => {
			const error = new AppError('Test', 500);

			expect(error instanceof Error).toBe(true);
			expect(error instanceof AppError).toBe(true);
		});

		it('should be caught by Error catch blocks', () => {
			const throwAppError = () => {
				throw new AppError('Test error', 400);
			};

			expect(() => throwAppError()).toThrow(Error);
			expect(() => throwAppError()).toThrow(AppError);
		});

		it('should have proper toString representation', () => {
			const error = new AppError('Test message', 400);
			const errorString = error.toString();

			expect(errorString).toContain('AppError');
			expect(errorString).toContain('Test message');
		});
	});

	describe('edge cases', () => {
		it('should handle undefined message', () => {
			// TypeScript should prevent this, but testing runtime behavior
			const error = new AppError(undefined as any, 400);

			expect(error.message).toBe('');
			expect(error.statusCode).toBe(400);
		});

		it('should handle null message', () => {
			// TypeScript should prevent this, but testing runtime behavior
			const error = new AppError(null as any, 400);

			expect(error.message).toBe('null');
			expect(error.statusCode).toBe(400);
		});

		it('should handle very large status codes', () => {
			const error = new AppError('Test', 999999);

			expect(error.statusCode).toBe(999999);
			expect(error.status).toBe('error'); // doesn't start with '4'
		});

		it('should handle negative status codes', () => {
			const error = new AppError('Test', -1);

			expect(error.statusCode).toBe(-1);
			expect(error.status).toBe('error'); // doesn't start with '4'
		});

		it('should handle zero status code', () => {
			const error = new AppError('Test', 0);

			expect(error.statusCode).toBe(0);
			expect(error.status).toBe('error'); // doesn't start with '4'
		});
	});
});
