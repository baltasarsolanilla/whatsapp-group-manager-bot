import { blacklistService } from '@logic/services';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
import { Request, Response } from 'express';

// blacklist entry point (Admin events)
export const blacklistController = {
	add: catchAsync(async (req: Request, res: Response) => {
		const { phoneNumber, groupId } = req.body;
		await blacklistService.add(phoneNumber, groupId);
		resSuccess(res, { message: 'Added to blacklist' });
	}),
	remove: catchAsync(async (req: Request, res: Response) => {
		const { phoneNumber, groupId } = req.body;
		await blacklistService.remove(phoneNumber, groupId);
		resSuccess(res, { message: 'Removed from blacklist' });
	}),
	list: catchAsync(async (req: Request, res: Response) => {
		const groupId = req.query.groupId as string | undefined;
		const members = await blacklistService.list(groupId);
		resSuccess(res, members);
	}),
};
