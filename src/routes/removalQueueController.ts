/* eslint-disable no-console */
import { removalQueueService } from '@logic/services';
import { Request, Response } from 'express';

export const removalQueueController = {
	async runRemovalQueue(req: Request, res: Response) {
		try {
			const { groupId } = req.body;
			const membersRemoved =
				await removalQueueService.removeInactiveMembers(groupId);
			return res.json(membersRemoved);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
	async listRemovalQueue(req: Request, res: Response) {
		try {
			const groupId = req.query.groupId as string;
			const members = await removalQueueService.listInactiveMembers(groupId);
			return res.json(members);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
};
