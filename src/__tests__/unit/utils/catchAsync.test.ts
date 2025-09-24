import { catchAsync } from '@utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

describe('catchAsync', () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: NextFunction;

	beforeEach(() => {
		mockReq = {};
		mockRes = {};
		mockNext = jest.fn();
	});

	it('should call the async function and return its result', async () => {
		const mockAsyncFn = jest.fn().mockResolvedValue('success');
		const wrappedFn = catchAsync(mockAsyncFn);

		await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

		expect(mockAsyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it('should call next with error when async function rejects', async () => {
		const error = new Error('Test error');
		const mockAsyncFn = jest.fn().mockRejectedValue(error);
		const wrappedFn = catchAsync(mockAsyncFn);

		await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

		expect(mockAsyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
		expect(mockNext).toHaveBeenCalledWith(error);
	});

	it('should handle synchronous errors in async function', async () => {
		const error = new Error('Sync error');
		const mockAsyncFn = jest.fn().mockImplementation(async () => {
			throw error;
		});
		const wrappedFn = catchAsync(mockAsyncFn);

		await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

		expect(mockNext).toHaveBeenCalledWith(error);
	});
});