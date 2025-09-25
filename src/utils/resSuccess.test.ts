/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import { resSuccess } from './resSuccess';

describe('resSuccess', () => {
	let mockRes: Partial<Response>;
	let mockJson: jest.MockedFunction<any>;
	let mockStatus: jest.MockedFunction<any>;

	beforeEach(() => {
		mockJson = jest.fn().mockReturnThis();
		mockStatus = jest.fn().mockReturnValue({ json: mockJson });

		mockRes = {
			status: mockStatus,
			json: mockJson,
		};
	});

	describe('basic functionality', () => {
		it('should set status to 200 and return json response with payload', () => {
			const payload = { message: 'Success', data: { id: 1 } };

			resSuccess(mockRes as Response, payload);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});

		it('should handle undefined payload', () => {
			resSuccess(mockRes as Response);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(undefined);
		});

		it('should handle null payload', () => {
			const payload = null as any;

			resSuccess(mockRes as Response, payload);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});

		it('should handle empty object payload', () => {
			const payload = {};

			resSuccess(mockRes as Response, payload);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});
	});

	describe('payload type handling', () => {
		it('should handle string payload', () => {
			const payload = 'simple string';

			resSuccess(mockRes as Response, payload as any);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});

		it('should handle number payload', () => {
			const payload = 42;

			resSuccess(mockRes as Response, payload as any);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});

		it('should handle boolean payload', () => {
			const payload = true;

			resSuccess(mockRes as Response, payload as any);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});

		it('should handle array payload', () => {
			const payload = [1, 2, 3, 'test'];

			resSuccess(mockRes as Response, payload as any);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});

		it('should handle nested object payload', () => {
			const payload = {
				user: {
					id: 1,
					name: 'John Doe',
					profile: {
						avatar: 'avatar.jpg',
						preferences: {
							theme: 'dark',
							notifications: true,
						},
					},
				},
				metadata: {
					timestamp: '2023-01-01',
					version: '1.0',
				},
			};

			resSuccess(mockRes as Response, payload);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});
	});

	describe('response chaining', () => {
		it('should properly chain status and json methods', () => {
			const payload = { test: 'data' };

			resSuccess(mockRes as Response, payload);

			// Verify that status returns an object with json method
			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockStatus().json).toBeDefined();
			expect(mockJson).toHaveBeenCalledWith(payload);
		});

		it('should handle response object without proper chaining', () => {
			// Test edge case where status doesn't return chainable object
			const mockStatusNoChain = jest.fn().mockReturnValue(undefined);
			const mockResNoChain = {
				status: mockStatusNoChain,
				json: mockJson,
			};

			expect(() => {
				resSuccess(mockResNoChain as any, { test: 'data' });
			}).toThrow();
		});
	});

	describe('common response patterns', () => {
		it('should handle success message with data', () => {
			const payload = {
				success: true,
				message: 'Operation completed successfully',
				data: { id: 123, name: 'Test Item' },
			};

			resSuccess(mockRes as Response, payload);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});

		it('should handle pagination response', () => {
			const payload = {
				data: [{ id: 1 }, { id: 2 }, { id: 3 }],
				pagination: {
					page: 1,
					limit: 10,
					total: 3,
					hasNext: false,
				},
			};

			resSuccess(mockRes as Response, payload);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});

		it('should handle API response with metadata', () => {
			const payload = {
				data: { userId: 1, action: 'login' },
				meta: {
					timestamp: Date.now(),
					requestId: 'req-123',
					apiVersion: 'v1',
				},
			};

			resSuccess(mockRes as Response, payload);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});
	});

	describe('edge cases and error scenarios', () => {
		it('should handle very large payloads', () => {
			const largeArray = new Array(1000)
				.fill(0)
				.map((_, i) => ({ id: i, data: `item_${i}` }));
			const payload = { items: largeArray };

			resSuccess(mockRes as Response, payload);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});

		it('should handle payload with circular references', () => {
			const payload: any = { name: 'test' };
			payload.self = payload; // Create circular reference

			// The function should call json with the payload, but JSON.stringify will fail
			// This tests that our function doesn't try to serialize the payload itself
			resSuccess(mockRes as Response, payload);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});

		it('should handle payload with special characters', () => {
			const payload = {
				message: 'Special chars: äöü ñ 中文 🎉 \n\t\r',
				data: {
					unicode: '\\u0041\\u0042\\u0043',
					emoji: '👍🎊🚀',
				},
			};

			resSuccess(mockRes as Response, payload);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});

		it('should handle payload with Date objects', () => {
			const payload = {
				createdAt: new Date(),
				updatedAt: new Date('2023-01-01'),
				data: 'test',
			};

			resSuccess(mockRes as Response, payload);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});

		it('should handle payload with undefined properties', () => {
			const payload = {
				definedProp: 'value',
				undefinedProp: undefined,
				nullProp: null,
			};

			resSuccess(mockRes as Response, payload);

			expect(mockStatus).toHaveBeenCalledWith(200);
			expect(mockJson).toHaveBeenCalledWith(payload);
		});
	});

	describe('function signature and return behavior', () => {
		it('should not return any value', () => {
			const payload = { test: 'data' };
			const result = resSuccess(mockRes as Response, payload);

			expect(result).toBeUndefined();
		});

		it('should be callable with minimum required parameters', () => {
			expect(() => {
				resSuccess(mockRes as Response);
			}).not.toThrow();
		});

		it('should handle missing response object gracefully', () => {
			expect(() => {
				resSuccess(null as any);
			}).toThrow();
		});

		it('should handle response object without status method', () => {
			const invalidRes = {
				json: mockJson,
			};

			expect(() => {
				resSuccess(invalidRes as any);
			}).toThrow();
		});

		it('should handle response object without json method on status return', () => {
			const mockStatusWithoutJson = jest.fn().mockReturnValue({});
			const invalidRes = {
				status: mockStatusWithoutJson,
			};

			expect(() => {
				resSuccess(invalidRes as any, { test: 'data' });
			}).toThrow();
		});
	});
});
