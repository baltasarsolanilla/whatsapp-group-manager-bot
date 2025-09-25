/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { NextFunction, Request, Response } from 'express';
import axios from 'axios';
import { handleAxiosError, errorHandler } from './errorHandler';
import { AppError } from './AppError';

// Mock console methods to avoid cluttering test output
const originalConsoleError = console.error;
beforeAll(() => {
	console.error = jest.fn();
});

afterAll(() => {
	console.error = originalConsoleError;
});

describe('errorHandler module', () => {
	describe('handleAxiosError', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		describe('Axios error handling', () => {
			it('should handle AxiosError with response data', () => {
				const axiosError = {
					message: 'Request failed',
					response: {
						data: { error: 'Server error', code: 500 },
					},
					isAxiosError: true,
				};

				// Mock axios.isAxiosError to return true
				jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

				expect(() => handleAxiosError(axiosError)).toThrow(AppError);

				try {
					handleAxiosError(axiosError);
				} catch (error) {
					expect(error).toBeInstanceOf(AppError);
					expect((error as AppError).statusCode).toBe(404);
					expect((error as AppError).message).toBe(
						JSON.stringify({
							message: axiosError.message,
							data: axiosError.response.data,
						})
					);
				}

				expect(console.error).toHaveBeenCalledWith(
					'[AxiosError]',
					axiosError.message,
					axiosError.response.data
				);
			});

			it('should handle AxiosError without response data', () => {
				const axiosError = {
					message: 'Network error',
					response: undefined,
					isAxiosError: true,
				};

				jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

				expect(() => handleAxiosError(axiosError)).toThrow(AppError);

				try {
					handleAxiosError(axiosError);
				} catch (error) {
					expect(error).toBeInstanceOf(AppError);
					expect((error as AppError).statusCode).toBe(404);
					expect((error as AppError).message).toBe(
						JSON.stringify({
							message: axiosError.message,
							data: undefined,
						})
					);
				}

				expect(console.error).toHaveBeenCalledWith(
					'[AxiosError]',
					axiosError.message,
					undefined
				);
			});

			it('should handle AxiosError with null response', () => {
				const axiosError = {
					message: 'Connection error',
					response: null as any,
					isAxiosError: true,
				};

				jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

				expect(() => handleAxiosError(axiosError)).toThrow(AppError);

				try {
					handleAxiosError(axiosError);
				} catch (error) {
					expect((error as AppError).message).toBe(
						JSON.stringify({
							message: axiosError.message,
							data: axiosError.response?.data,
						})
					);
				}
			});

			it('should handle AxiosError with empty response data', () => {
				const axiosError = {
					message: 'Bad request',
					response: { data: '' },
					isAxiosError: true,
				};

				jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

				expect(() => handleAxiosError(axiosError)).toThrow(AppError);

				try {
					handleAxiosError(axiosError);
				} catch (error) {
					expect((error as AppError).message).toBe(
						JSON.stringify({
							message: axiosError.message,
							data: '',
						})
					);
				}
			});

			it('should handle AxiosError with complex response data', () => {
				const complexData = {
					errors: [
						{ field: 'email', message: 'Invalid email' },
						{ field: 'password', message: 'Too short' },
					],
					timestamp: '2023-01-01T00:00:00Z',
					path: '/api/users',
				};

				const axiosError = {
					message: 'Validation failed',
					response: { data: complexData },
					isAxiosError: true,
				};

				jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

				expect(() => handleAxiosError(axiosError)).toThrow(AppError);

				try {
					handleAxiosError(axiosError);
				} catch (error) {
					expect((error as AppError).message).toBe(
						JSON.stringify({
							message: axiosError.message,
							data: complexData,
						})
					);
				}
			});
		});

		describe('Non-Axios error handling', () => {
			it('should handle regular Error objects', () => {
				const regularError = new Error('Regular error message');

				jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);

				expect(() => handleAxiosError(regularError)).toThrow(AppError);

				try {
					handleAxiosError(regularError);
				} catch (error) {
					expect(error).toBeInstanceOf(AppError);
					expect((error as AppError).statusCode).toBe(404);
					expect((error as AppError).message).toBe('UnexpectedError');
				}

				expect(console.error).toHaveBeenCalledWith(
					'[UnexpectedError]',
					regularError
				);
			});

			it('should handle string errors', () => {
				const stringError = 'String error message';

				jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);

				expect(() => handleAxiosError(stringError)).toThrow(AppError);

				try {
					handleAxiosError(stringError);
				} catch (error) {
					expect((error as AppError).message).toBe('UnexpectedError');
				}

				expect(console.error).toHaveBeenCalledWith(
					'[UnexpectedError]',
					stringError
				);
			});

			it('should handle null errors', () => {
				jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);

				expect(() => handleAxiosError(null)).toThrow(AppError);

				try {
					handleAxiosError(null);
				} catch (error) {
					expect((error as AppError).message).toBe('UnexpectedError');
				}

				expect(console.error).toHaveBeenCalledWith('[UnexpectedError]', null);
			});

			it('should handle undefined errors', () => {
				jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);

				expect(() => handleAxiosError(undefined)).toThrow(AppError);

				try {
					handleAxiosError(undefined);
				} catch (error) {
					expect((error as AppError).message).toBe('UnexpectedError');
				}

				expect(console.error).toHaveBeenCalledWith(
					'[UnexpectedError]',
					undefined
				);
			});

			it('should handle object errors without message', () => {
				const objectError = { code: 500, details: 'Some details' };

				jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);

				expect(() => handleAxiosError(objectError)).toThrow(AppError);

				expect(console.error).toHaveBeenCalledWith(
					'[UnexpectedError]',
					objectError
				);
			});
		});

		describe('edge cases', () => {
			it('should handle AxiosError with circular reference in response data', () => {
				const circularData: any = { message: 'error' };
				circularData.self = circularData;

				const axiosError = {
					message: 'Circular error',
					response: { data: circularData },
					isAxiosError: true,
				};

				jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

				// This should throw a TypeError due to circular reference in JSON.stringify
				expect(() => handleAxiosError(axiosError)).toThrow(TypeError);
			});

			it('should handle very long error messages', () => {
				const longMessage = 'A'.repeat(10000);
				const axiosError = {
					message: longMessage,
					response: { data: 'response data' },
					isAxiosError: true,
				};

				jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

				expect(() => handleAxiosError(axiosError)).toThrow(AppError);
			});
		});
	});

	describe('errorHandler', () => {
		let mockReq: Partial<Request>;
		let mockRes: Partial<Response>;
		let mockNext: NextFunction;
		let mockJson: jest.MockedFunction<any>;
		let mockStatus: jest.MockedFunction<any>;

		beforeEach(() => {
			mockJson = jest.fn().mockReturnThis();
			mockStatus = jest.fn().mockReturnValue({ json: mockJson });

			mockReq = {};
			mockRes = {
				status: mockStatus,
				json: mockJson,
			};
			mockNext = jest.fn();
		});

		describe('Error object handling', () => {
			it('should handle Error instances with message', () => {
				const error = new Error('Test error message');

				errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

				expect(mockStatus).toHaveBeenCalledWith(500);
				expect(mockJson).toHaveBeenCalledWith({
					error: 'Test error message',
				});
			});

			it('should handle AppError instances', () => {
				const appError = new AppError('App error message', 400);

				errorHandler(
					appError,
					mockReq as Request,
					mockRes as Response,
					mockNext
				);

				expect(mockStatus).toHaveBeenCalledWith(500);
				expect(mockJson).toHaveBeenCalledWith({
					error: 'App error message',
				});
			});

			it('should handle Error with empty message', () => {
				const error = new Error('');

				errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

				expect(mockJson).toHaveBeenCalledWith({
					error: '',
				});
			});

			it('should handle Error with undefined message', () => {
				const error = new Error();
				error.message = undefined as any;

				errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

				expect(mockJson).toHaveBeenCalledWith({
					error: undefined,
				});
			});
		});

		describe('Non-Error object handling', () => {
			it('should handle string errors', () => {
				const error = 'String error message';

				errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

				expect(mockStatus).toHaveBeenCalledWith(500);
				expect(mockJson).toHaveBeenCalledWith({
					error: 'Internal server error',
				});
			});

			it('should handle null errors', () => {
				errorHandler(null, mockReq as Request, mockRes as Response, mockNext);

				expect(mockJson).toHaveBeenCalledWith({
					error: 'Internal server error',
				});
			});

			it('should handle undefined errors', () => {
				errorHandler(
					undefined,
					mockReq as Request,
					mockRes as Response,
					mockNext
				);

				expect(mockJson).toHaveBeenCalledWith({
					error: 'Internal server error',
				});
			});

			it('should handle number errors', () => {
				errorHandler(404, mockReq as Request, mockRes as Response, mockNext);

				expect(mockJson).toHaveBeenCalledWith({
					error: 'Internal server error',
				});
			});

			it('should handle boolean errors', () => {
				errorHandler(false, mockReq as Request, mockRes as Response, mockNext);

				expect(mockJson).toHaveBeenCalledWith({
					error: 'Internal server error',
				});
			});

			it('should handle object errors', () => {
				const objectError = { message: 'Object error', code: 500 };

				errorHandler(
					objectError,
					mockReq as Request,
					mockRes as Response,
					mockNext
				);

				expect(mockJson).toHaveBeenCalledWith({
					error: 'Internal server error',
				});
			});

			it('should handle array errors', () => {
				const arrayError = ['error1', 'error2'];

				errorHandler(
					arrayError,
					mockReq as Request,
					mockRes as Response,
					mockNext
				);

				expect(mockJson).toHaveBeenCalledWith({
					error: 'Internal server error',
				});
			});
		});

		describe('response behavior', () => {
			it('should always set status to 500', () => {
				const variations = [
					new Error('test'),
					'string error',
					{ custom: 'error' },
					null,
					undefined,
					42,
				];

				variations.forEach((error) => {
					jest.clearAllMocks();
					errorHandler(
						error,
						mockReq as Request,
						mockRes as Response,
						mockNext
					);
					expect(mockStatus).toHaveBeenCalledWith(500);
				});
			});

			it('should not call next function', () => {
				const error = new Error('Test error');

				errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

				expect(mockNext).not.toHaveBeenCalled();
			});

			it('should handle response chaining properly', () => {
				const error = new Error('Test error');

				errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

				expect(mockStatus).toHaveBeenCalledWith(500);
				expect(mockStatus().json).toBeDefined();
				expect(mockJson).toHaveBeenCalledWith({ error: 'Test error' });
			});
		});

		describe('edge cases', () => {
			it('should handle Error objects with custom properties', () => {
				const error = new Error('Custom error') as any;
				error.statusCode = 400;
				error.customProp = 'custom value';

				errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

				expect(mockJson).toHaveBeenCalledWith({
					error: 'Custom error',
				});
			});

			it('should handle Error with getter for message', () => {
				const error = new Error();
				Object.defineProperty(error, 'message', {
					get: () => 'Dynamic message',
				});

				errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

				expect(mockJson).toHaveBeenCalledWith({
					error: 'Dynamic message',
				});
			});

			it('should handle Error that throws when accessing message', () => {
				const error = new Error() as any;
				Object.defineProperty(error, 'message', {
					get: () => {
						throw new Error('Message access error');
					},
				});

				// This should throw when trying to access the message property
				expect(() => {
					errorHandler(
						error,
						mockReq as Request,
						mockRes as Response,
						mockNext
					);
				}).toThrow('Message access error');
			});
		});

		describe('function signature', () => {
			it('should accept all required Express error handler parameters', () => {
				expect(errorHandler.length).toBe(4); // err, req, res, next

				const error = new Error('test');
				expect(() => {
					errorHandler(
						error,
						mockReq as Request,
						mockRes as Response,
						mockNext
					);
				}).not.toThrow();
			});

			it('should not return any value', () => {
				const error = new Error('test');
				const result = errorHandler(
					error,
					mockReq as Request,
					mockRes as Response,
					mockNext
				);

				expect(result).toBeUndefined();
			});
		});
	});
});
