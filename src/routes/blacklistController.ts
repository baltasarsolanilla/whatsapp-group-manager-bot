/* eslint-disable no-console */
import { blacklistService } from '@logic/services';
import { Request, Response } from 'express';

export const blacklistController = {
	async add(req: Request, res: Response) {
		try {
			const { phoneNumber, groupId } = req.body;
			await blacklistService.add(phoneNumber, groupId);
			res.status(201).json({ message: 'Added to blacklist' });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
	async remove(req: Request, res: Response) {
		try {
			const { phoneNumber, groupId } = req.body;
			await blacklistService.remove(phoneNumber, groupId);
			res.status(201).json({ message: 'Removed from blacklist' });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
	async list(req: Request, res: Response) {
		try {
			const groupId = req.query.groupId as string | undefined;
			const members = await blacklistService.list(groupId);
			res.json(members);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
};
