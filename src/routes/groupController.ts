import { groupService } from '@logic/services';
import { evolutionAPI } from '@services/evolutionAPI';
import { Request, Response } from 'express';

export const groupController = {
	async ingest(req: Request, res: Response) {
		try {
			const { whatsappId } = req.body;
			const groupData =
				await evolutionAPI.groupService.fetchGroupByWaId(whatsappId);

			if (groupData) {
				const { group, users } = await groupService.ingest(groupData);
				res.status(201).json({ group, users });
			} else {
				throw new Error('Group information not found');
			}
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
};
