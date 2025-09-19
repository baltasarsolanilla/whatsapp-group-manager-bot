import { groupService } from '@logic/services';
import { Group } from '@prisma/client';
import { evolutionAPI } from '@services/evolutionAPI';
import { AppError } from '@utils/AppError';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
import { Request, Response } from 'express';

export const groupController = {
	ingest: catchAsync(async (req: Request, res: Response) => {
		const { whatsappId } = req.body;
		if (!whatsappId) {
			throw AppError.required('whatsappId is required');
		}
		const groupData = await evolutionAPI.groupService.fetchGroup(whatsappId);

		if (!groupData) {
			throw AppError.notFound('Group information not found');
		}

		const { group, users, whitelist } = await groupService.ingest(groupData);
		resSuccess(res, { group, users, whitelist });
	}),
	update: catchAsync(
		async (
			// eslint-disable-next-line @typescript-eslint/no-empty-object-type
			req: Request<{}, {}, Partial<Group>>,
			res: Response
		) => {
			const whatsappId = req.query.groupId as string;
			const payload = req.body;

			if (!whatsappId) {
				throw AppError.required('whatsappId query parameter is required');
			}

			const group = await groupService.update(whatsappId, payload);

			if (!group) {
				throw AppError.notFound('Group not found');
			}

			resSuccess(res, { group });
		}
	),
};
