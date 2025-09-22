import { groupService } from '@logic/services';
import { Group } from '@prisma/client';
import { evolutionAPI } from '@services/evolutionAPI';
import { AppError } from '@utils/AppError';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
import { Request, Response } from 'express';

export const groupController = {
	ingest: catchAsync(async (req: Request, res: Response) => {
		const { groupWaId } = req.body;
		if (!groupWaId) {
			throw AppError.required('groupWaId is required');
		}
		const groupData = await evolutionAPI.groupService.fetchGroup(groupWaId);

		if (!groupData) {
			throw AppError.notFound('Group not found');
		}

		const { group, users, whitelist } = await groupService.ingest(groupData);
		resSuccess(res, { group, users, whitelist });
	}),
	update: catchAsync(async (req: Request, res: Response) => {
		const groupWaId = (req.params as { id: string }).id;
		const payload = req.body as Partial<Group>;

		const group = await groupService.update(groupWaId, payload);

		if (!group) {
			throw AppError.notFound(`Group not found: ${groupWaId}`);
		}

		resSuccess(res, { group });
	}),
};
