import { blacklistService } from '@logic/services';
import { AppError } from '@utils/AppError';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
import { Request, Response } from 'express';
import { createMemberListController } from './baseMemberListController';

// Get base functionality from the generic controller
const baseBlacklistController = createMemberListController(
	blacklistService,
	'blacklist'
);

// Enhanced blacklist controller with auto-removal functionality
export const blacklistController = {
	// Keep existing functionality
	...baseBlacklistController,

	// Override the add method to support auto-removal
	add: catchAsync(async (req: Request, res: Response) => {
		const { phoneNumber, groupId, reason, skipRemoval = false } = req.body;

		// Validate required parameters
		if (!phoneNumber || !groupId) {
			throw AppError.required('phoneNumber and groupId are required');
		}

		// Use the enhanced service method if skipRemoval is provided, otherwise use base method
		if ('skipRemoval' in req.body) {
			await blacklistService.add(phoneNumber, groupId);
			resSuccess(res, {
				message: 'Added to blacklist',
				reason: reason ?? null,
			});
		} else {
			const result = await blacklistService.addToBlacklistWithRemoval(
				phoneNumber,
				groupId,
				skipRemoval
			);

			resSuccess(res, {
				message: 'Added to blacklist',
				blacklistEntry: result.blacklistEntry,
				removalResults: result.removalResults,
				skipRemoval: result.skipRemoval,
				reason: reason ?? null,
			});
		}
	}),
};
