import { AppError } from '@utils/AppError';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
import { Request, Response } from 'express';

// Generic interface for member list service operations
interface IMemberListService {
	add(params: {
		phoneNumber?: string;
		whatsappId?: string;
		groupWaId: string;
	}): Promise<unknown>;
	remove(params: {
		phoneNumber?: string;
		whatsappId?: string;
		groupWaId: string;
	}): Promise<unknown>;
	list(groupWaId?: string): Promise<unknown[]>;
}

// Generic controller factory
export function createMemberListController(
	service: IMemberListService,
	entityName: string
) {
	return {
		add: catchAsync(async (req: Request, res: Response) => {
			const { phoneNumber, whatsappId, groupId } = req.body;

			// Validate that either phoneNumber or whatsappId is provided
			if (!phoneNumber && !whatsappId) {
				throw AppError.required('Either phoneNumber or whatsappId is required');
			}

			if (phoneNumber && whatsappId) {
				throw AppError.badRequest(
					'Provide either phoneNumber or whatsappId, not both'
				);
			}

			await service.add({ phoneNumber, whatsappId, groupWaId: groupId });
			resSuccess(res, { message: `Added to ${entityName}` });
		}),

		remove: catchAsync(async (req: Request, res: Response) => {
			const { phoneNumber, whatsappId, groupId } = req.body;

			// Validate that either phoneNumber or whatsappId is provided
			if (!phoneNumber && !whatsappId) {
				throw AppError.required('Either phoneNumber or whatsappId is required');
			}

			if (phoneNumber && whatsappId) {
				throw AppError.badRequest(
					'Provide either phoneNumber or whatsappId, not both'
				);
			}

			await service.remove({ phoneNumber, whatsappId, groupWaId: groupId });
			resSuccess(res, { message: `Removed from ${entityName}` });
		}),

		list: catchAsync(async (req: Request, res: Response) => {
			const groupId = req.query.groupId as string | undefined;
			const members = await service.list(groupId);
			resSuccess(res, members);
		}),
	};
}
