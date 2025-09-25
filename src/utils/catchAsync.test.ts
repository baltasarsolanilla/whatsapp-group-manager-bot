/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { catchAsync } from './catchAsync';

// Create mock types for Express objects
const createMockRequest = (): Partial<Request> => ({});
const createMockResponse = (): Partial<Response> => ({});

describe('catchAsync', () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: jest.MockedFunction<NextFunction>;

	beforeEach(() => {
		mockReq = createMockRequest();
		mockRes = createMockResponse();
		mockNext = jest.fn();
	});

	describe('successful async function execution', () => {
		it('should execute async function successfully without calling next', async () => {
			const asyncFn = jest.fn().mockResolvedValue('success');
			const wrappedFn = catchAsync(asyncFn);

			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

			expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should handle async function that returns undefined', async () => {
			const asyncFn = jest.fn().mockResolvedValue(undefined);
			const wrappedFn = catchAsync(asyncFn);

			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

			expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should handle async function that returns null', async () => {
			const asyncFn = jest.fn().mockResolvedValue(null);
			const wrappedFn = catchAsync(asyncFn);

			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

			expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should handle async function that returns complex objects', async () => {
			const complexResult = { data: 'test', nested: { value: 123 } };
			const asyncFn = jest.fn().mockResolvedValue(complexResult);
			const wrappedFn = catchAsync(asyncFn);

			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

			expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	describe('error handling', () => {
		it('should call next with error when async function throws', async () => {
			const error = new Error('Test error');
			const asyncFn = jest.fn().mockRejectedValue(error);
			const wrappedFn = catchAsync(asyncFn);

			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

			expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
			expect(mockNext).toHaveBeenCalledWith(error);
		});

		it('should handle string errors', async () => {
			const error = 'String error';
			const asyncFn = jest.fn().mockRejectedValue(error);
			const wrappedFn = catchAsync(asyncFn);

			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});

		it('should handle null errors', async () => {
			const asyncFn = jest.fn().mockRejectedValue(null);
			const wrappedFn = catchAsync(asyncFn);

			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalledWith(null);
		});

		it('should handle undefined errors', async () => {
			const asyncFn = jest.fn().mockRejectedValue(undefined);
			const wrappedFn = catchAsync(asyncFn);

			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalledWith(undefined);
		});

		it('should handle custom error objects', async () => {
			const customError = { message: 'Custom error', code: 500 };
			const asyncFn = jest.fn().mockRejectedValue(customError);
			const wrappedFn = catchAsync(asyncFn);

			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalledWith(customError);
		});
	});

	describe('function wrapping behavior', () => {
		it('should return a function that accepts req, res, next', () => {
			const asyncFn = jest.fn().mockResolvedValue(undefined);
			const wrappedFn = catchAsync(asyncFn);

			expect(typeof wrappedFn).toBe('function');
			expect(wrappedFn.length).toBe(3); // Should accept 3 parameters
		});

		it('should preserve the original function call signature', async () => {
			const asyncFn = jest.fn().mockResolvedValue('result');
			const wrappedFn = catchAsync(asyncFn);

			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

			expect(asyncFn).toHaveBeenCalledTimes(1);
			expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
		});

		it('should handle multiple calls to the same wrapped function', async () => {
			const asyncFn = jest.fn().mockResolvedValue('result');
			const wrappedFn = catchAsync(asyncFn);

			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);
			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

			expect(asyncFn).toHaveBeenCalledTimes(2);
		});
	});

	describe('synchronous function behavior', () => {
		it('should handle functions that return promises directly', async () => {
			const asyncFn = (_req: Request, _res: Response, _next: NextFunction) => {
				return Promise.resolve('direct promise');
			};
			const wrappedFn = catchAsync(asyncFn);

			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should handle functions that return rejected promises directly', async () => {
			const error = new Error('Direct rejection');
			const asyncFn = (_req: Request, _res: Response, _next: NextFunction) => {
				return Promise.reject(error);
			};
			const wrappedFn = catchAsync(asyncFn);

			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe('edge cases', () => {
		it('should handle async functions with delayed success', async () => {
			const asyncFn = jest.fn().mockImplementation(async () => {
				await new Promise((resolve) => setTimeout(resolve, 1));
				return 'delayed success';
			});
			const wrappedFn = catchAsync(asyncFn);

			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	describe('parameter passing', () => {
		it('should pass all parameters correctly to the wrapped function', async () => {
			const asyncFn = jest.fn().mockResolvedValue(undefined);
			const wrappedFn = catchAsync(asyncFn);

			const specificReq = { body: { test: 'data' } } as Request;
			const specificRes = { json: jest.fn() } as Partial<Response> as Response;
			const specificNext = jest.fn() as NextFunction;

			await wrappedFn(specificReq, specificRes, specificNext);

			expect(asyncFn).toHaveBeenCalledWith(
				specificReq,
				specificRes,
				specificNext
			);
		});

		it('should maintain this context if function uses it', async () => {
			const context = { value: 'test' };
			const asyncFn = jest.fn(function (this: any) {
				return Promise.resolve(this.value);
			});

			const wrappedFn = catchAsync(asyncFn.bind(context));

			await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

			expect(asyncFn).toHaveBeenCalled();
			expect(mockNext).not.toHaveBeenCalled();
		});
	});
});
