import { groupMembershipService } from '@logic/services/groupMembershipService';
import { AppError } from '@utils/AppError';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
import { Request, Response } from 'express';

export const groupMembershipController = {
	updateRole: catchAsync(async (req: Request, res: Response) => {
		const { userWhatsappId, groupWhatsappId, role } = req.body;

		// Validate required fields
		if (!userWhatsappId) {
			throw AppError.required('userWhatsappId is required');
		}

		if (!groupWhatsappId) {
			throw AppError.required('groupWhatsappId is required');
		}

		if (!role) {
			throw AppError.required('role is required');
		}

		// Validate role value
		if (role !== 'ADMIN' && role !== 'MEMBER') {
			throw AppError.badRequest('role must be either ADMIN or MEMBER');
		}

		const membership = await groupMembershipService.updateMemberRole({
			userWhatsappId,
			groupWhatsappId,
			role,
		});

		resSuccess(res, {
			message: 'Member role updated successfully',
			membership,
		});
	}),

	getMembership: catchAsync(async (req: Request, res: Response) => {
		const userWhatsappId = req.query.userWhatsappId as string;
		const groupWhatsappId = req.query.groupWhatsappId as string;
		const role = req.query.role as string | undefined;

		// Validate required fields
		if (!groupWhatsappId) {
			throw AppError.required('groupWhatsappId is required');
		}

		// If role is specified, return all members with that role
		if (role) {
			// Validate role value
			if (role !== 'ADMIN' && role !== 'MEMBER') {
				throw AppError.badRequest('role must be either ADMIN or MEMBER');
			}

			const members = await groupMembershipService.getMembersByRole({
				groupWhatsappId,
				role: role as 'ADMIN' | 'MEMBER',
			});

			resSuccess(res, members);
			return;
		}

		// Otherwise, return a specific user's membership
		if (!userWhatsappId) {
			throw AppError.required('userWhatsappId is required');
		}

		const membership = await groupMembershipService.getMembership({
			userWhatsappId,
			groupWhatsappId,
		});

		resSuccess(res, membership);
	}),
};
