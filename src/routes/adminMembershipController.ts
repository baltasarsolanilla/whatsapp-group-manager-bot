import { adminMembershipService } from '@logic/services/adminMembershipService';
import { AppError } from '@utils/AppError';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
import { Request, Response } from 'express';

export const adminMembershipController = {
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

		const membership = await adminMembershipService.updateMemberRole({
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

		// Validate required fields
		if (!userWhatsappId) {
			throw AppError.required('userWhatsappId is required');
		}

		if (!groupWhatsappId) {
			throw AppError.required('groupWhatsappId is required');
		}

		const membership = await adminMembershipService.getMembership({
			userWhatsappId,
			groupWhatsappId,
		});

		resSuccess(res, membership);
	}),
};
