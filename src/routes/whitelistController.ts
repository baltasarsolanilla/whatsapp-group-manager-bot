import { whitelistService } from '@logic/services';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
import { Request, Response } from 'express';

// whitelist entry point (Admin events)
export const whitelistController = {
	add: catchAsync(async (req: Request, res: Response) => {
		const { phoneNumber, groupId } = req.body;
		await whitelistService.add(phoneNumber, groupId);
		resSuccess(res, { message: 'Added to whitelist' });
	}),
	remove: catchAsync(async (req: Request, res: Response) => {
		const { phoneNumber, groupId } = req.body;
		await whitelistService.remove(phoneNumber, groupId);
		resSuccess(res, { message: 'Removed from whitelist' });
	}),
	list: catchAsync(async (req: Request, res: Response) => {
		const groupId = req.query.groupId as string | undefined;
		const members = await whitelistService.list(groupId);
		res.json(members);
		resSuccess(res, members);
	}),
};
