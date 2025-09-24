import { handleAxiosError, errorHandler } from '@utils/errorHandler';
import { Request, Response, NextFunction } from 'express';
import axios, { AxiosError } from 'axios';
import { AppError } from '@utils/AppError';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('handleAxiosError', () => {
	it('should handle AxiosError and throw AppError', () => {
		const axiosError = {
			isAxiosError: true,
			message: 'Network Error',
			response: {
				data: { error: 'Server error' },
			},
		} as AxiosError;

		mockedAxios.isAxiosError.mockReturnValue(true);

		expect(() => handleAxiosError(axiosError)).toThrow(AppError);
		expect(() => handleAxiosError(axiosError)).toThrow('Network Error');
	});

	it('should handle AxiosError without response data', () => {
		const axiosError = {
			isAxiosError: true,
			message: 'Network Error',
			response: undefined,
		} as AxiosError;

		mockedAxios.isAxiosError.mockReturnValue(true);

		expect(() => handleAxiosError(axiosError)).toThrow(AppError);
	});

	it('should handle non-AxiosError and throw generic error', () => {
		const genericError = new Error('Some other error');
		mockedAxios.isAxiosError.mockReturnValue(false);

		expect(() => handleAxiosError(genericError)).toThrow(AppError);
		expect(() => handleAxiosError(genericError)).toThrow('UnexpectedError');
	});
});

describe('errorHandler', () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: NextFunction;
	let mockJson: jest.Mock;
	let mockStatus: jest.Mock;

	beforeEach(() => {
		mockJson = jest.fn();
		mockStatus = jest.fn().mockReturnValue({ json: mockJson });
		mockReq = {};
		mockRes = {
			status: mockStatus,
			json: mockJson,
		};
		mockNext = jest.fn();
	});

	it('should handle Error instance', () => {
		const error = new Error('Test error message');

		errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

		expect(mockStatus).toHaveBeenCalledWith(500);
		expect(mockJson).toHaveBeenCalledWith({
			error: 'Test error message',
		});
	});

	it('should handle non-Error instance', () => {
		const error = 'String error';

		errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

		expect(mockStatus).toHaveBeenCalledWith(500);
		expect(mockJson).toHaveBeenCalledWith({
			error: 'Internal server error',
		});
	});

	it('should handle null/undefined error', () => {
		errorHandler(null, mockReq as Request, mockRes as Response, mockNext);

		expect(mockStatus).toHaveBeenCalledWith(500);
		expect(mockJson).toHaveBeenCalledWith({
			error: 'Internal server error',
		});
	});
});
