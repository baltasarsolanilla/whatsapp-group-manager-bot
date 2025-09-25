import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
import { Request, Response } from 'express';

// Generic interface for member list service operations
interface IMemberListService {
	add(phoneNumber: string, groupWaId: string): Promise<unknown>;
	remove(phoneNumber: string, groupWaId: string): Promise<unknown>;
	list(groupWaId?: string): Promise<unknown[]>;
}

// Generic controller factory
export function createMemberListController(
	service: IMemberListService,
	entityName: string
) {
	return {
		add: catchAsync(async (req: Request, res: Response) => {
			const { phoneNumber, groupId } = req.body;
			await service.add(phoneNumber, groupId);
			resSuccess(res, { message: `Added to ${entityName}` });
		}),

		remove: catchAsync(async (req: Request, res: Response) => {
			const { phoneNumber, groupId } = req.body;
			await service.remove(phoneNumber, groupId);
			resSuccess(res, { message: `Removed from ${entityName}` });
		}),

		list: catchAsync(async (req: Request, res: Response) => {
			const groupId = req.query.groupId as string | undefined;
			const members = await service.list(groupId);
			// Note: WhitelistController has an extra res.json(members) call, but resSuccess already handles response
			// We'll match the existing whitelist behavior by calling both for consistency
			if (entityName === 'whitelist') {
				res.json(members);
			}
			resSuccess(res, members);
		}),
	};
}
