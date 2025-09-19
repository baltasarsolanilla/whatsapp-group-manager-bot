import { groupService } from '@logic/services';
import { Group } from '@prisma/client';
import { evolutionAPI } from '@services/evolutionAPI';
import { Request, Response } from 'express';

export const groupController = {
	async ingest(req: Request, res: Response) {
		try {
			const { whatsappId } = req.body;
			if (!whatsappId) {
				return res.status(400).json({ error: 'whatsappId is required' });
			}
			const groupData = await evolutionAPI.groupService.fetchGroup(whatsappId);

			if (!groupData) {
				return res.status(404).json({ error: 'Group information not found' });
			}

			const { group, users, whitelist } = await groupService.ingest(groupData);
			res.status(201).json({ group, users, whitelist });
		} catch (err) {
			console.error('Ingest error:', err);
			res.status(500).json({
				error: err instanceof Error ? err.message : 'Internal server error',
			});
		}
	},
	async update(
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		req: Request<{}, {}, Partial<Group>>,
		res: Response
	) {
		try {
			const whatsappId = req.query.groupId as string;
			const payload = req.body;

			if (!whatsappId) {
				return res
					.status(400)
					.json({ error: 'groupId query parameter is required' });
			}

			const group = await groupService.update(whatsappId, payload);

			if (!group) {
				return res.status(404).json({ error: 'Group not found' });
			}

			res.status(200).json({ group });
		} catch (err) {
			res.status(500).json({
				error: err instanceof Error ? err.message : 'Internal server error',
			});
		}
	},
};
