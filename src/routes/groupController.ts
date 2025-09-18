import { Request, Response } from 'express';

export const groupController = {
	async ingest(req: Request, res: Response) {
		try {
			console.log('ingest group info to db');
			res.status(201).json({ message: 'Group ingest done!' });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
};
