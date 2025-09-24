import { resSuccess } from '@utils/resSuccess';
import { Response } from 'express';

describe('resSuccess', () => {
	let mockRes: Partial<Response>;
	let mockJson: jest.Mock;
	let mockStatus: jest.Mock;

	beforeEach(() => {
		mockJson = jest.fn();
		mockStatus = jest.fn().mockReturnValue({ json: mockJson });
		mockRes = {
			status: mockStatus,
			json: mockJson,
		};
	});

	it('should send 200 status with no payload', () => {
		resSuccess(mockRes as Response);

		expect(mockStatus).toHaveBeenCalledWith(200);
		expect(mockJson).toHaveBeenCalledWith(undefined);
	});

	it('should send 200 status with payload', () => {
		const payload = { message: 'success', data: { id: 1 } };
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
