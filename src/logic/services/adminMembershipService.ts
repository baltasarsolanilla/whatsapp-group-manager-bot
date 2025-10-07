import { groupRepository } from '@database/repositories/groupRepository';
import { groupMembershipRepository } from '@database/repositories/groupMembershipRepository';
import { userRepository } from '@database/repositories/userRepository';
import { AppError } from '@utils/AppError';
import type { MembershipRole } from '@prisma/client';

export const adminMembershipService = {
	/**
	 * Update the role of a member in a group
	 */
	async updateMemberRole({
		userWhatsappId,
		groupWhatsappId,
		role,
	}: {
		userWhatsappId: string;
		groupWhatsappId: string;
		role: MembershipRole;
	}) {
		// Get user by WhatsApp ID
		const user = await userRepository.getByWaId(userWhatsappId);
		if (!user) {
			throw AppError.notFound('User not found');
		}

		// Get group by WhatsApp ID
		const group = await groupRepository.getByWaId(groupWhatsappId);
		if (!group) {
			throw AppError.notFound('Group not found');
		}

		// Check if membership exists
		const membership = await groupMembershipRepository.getByUserAndGroup({
			userId: user.id,
			groupId: group.id,
		});

		if (!membership) {
			throw AppError.notFound('Membership not found');
		}

		// Update the role
		return groupMembershipRepository.updateRole({
			userId: user.id,
			groupId: group.id,
			role,
		});
	},

	/**
	 * Get membership details including role
	 */
	async getMembership({
		userWhatsappId,
		groupWhatsappId,
	}: {
		userWhatsappId: string;
		groupWhatsappId: string;
	}) {
		// Get user by WhatsApp ID
		const user = await userRepository.getByWaId(userWhatsappId);
		if (!user) {
			throw AppError.notFound('User not found');
		}

		// Get group by WhatsApp ID
		const group = await groupRepository.getByWaId(groupWhatsappId);
		if (!group) {
			throw AppError.notFound('Group not found');
		}

		// Get membership
		const membership = await groupMembershipRepository.getByUserAndGroup({
			userId: user.id,
			groupId: group.id,
		});

		if (!membership) {
			throw AppError.notFound('Membership not found');
		}

		return membership;
	},
};
