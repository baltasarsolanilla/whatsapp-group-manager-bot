/* eslint-disable no-console */
import { whitelistService } from '@logic/services';
import { Request, Response } from 'express';

export const whitelistController = {
	// whitelist entry point (Admin events)
	async add(req: Request, res: Response) {
		try {
			const { phoneNumber, groupId } = req.body;
			await whitelistService.add(phoneNumber, groupId);
			res.status(201).json({ message: 'Added to whitelist' });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
	async remove(req: Request, res: Response) {
		try {
			const { phoneNumber, groupId } = req.body;
			await whitelistService.remove(phoneNumber, groupId);
			res.status(201).json({ message: 'Removed from whitelist' });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
	async list(req: Request, res: Response) {
		try {
			const groupId = req.query.groupId as string | undefined;
			const members = await whitelistService.list(groupId);
			res.json(members);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
};
