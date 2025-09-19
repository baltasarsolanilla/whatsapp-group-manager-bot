import { removalQueueService } from '@logic/services';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
import { Request, Response } from 'express';

export const removalQueueController = {
	runRemovalQueue: catchAsync(async (req: Request, res: Response) => {
		const { groupId } = req.body;
		const membersRemoved =
			await removalQueueService.removeInactiveMembers(groupId);
		resSuccess(res, membersRemoved);
	}),
	listRemovalQueue: catchAsync(async (req: Request, res: Response) => {
		const groupWaId = req.query.groupId as string;
		const members = await removalQueueService.listInactiveMembers(groupWaId);
		resSuccess(res, members);
	}),
};
