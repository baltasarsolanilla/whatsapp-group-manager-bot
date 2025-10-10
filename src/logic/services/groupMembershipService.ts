import {
	groupMembershipRepository,
	groupRepository,
	userRepository,
} from '@database/repositories';
import { Group, MembershipRole, User } from '@prisma/client';
import { AppError } from '@utils/AppError';

export const groupMembershipService = {
	async getInactive(
		groupWaId: string
	): Promise<{ user: User; group: Group }[]> {
		// const days = 30;
		// const msPerDay = 24 * 60 * 60 * 1000;
		// const threshold = Date.now() - days * msPerDay;
		const test = 60 * 1 * 1000;
		const threshold = Date.now() - test;

		const group = await groupRepository.getByWaId(groupWaId);
		if (!group) {
			throw AppError.notFound(`Group not found: ${groupWaId}`);
		}
		const memberships = await groupMembershipRepository.listByGroupId(
			group.id,
			true
		);

		const inactiveMemberships = memberships.filter((m) => {
			const activity = m.lastActiveAt ?? m.joinDate;
			return activity.getTime() <= threshold;
		});

		return inactiveMemberships;
	},

	/**
	 * Check if a user is an admin in a specified group by WhatsApp IDs
	 * @param userWhatsappId - The WhatsApp user ID (e.g., "123456789@s.whatsapp.net")
	 * @param groupWhatsappId - The WhatsApp group ID (e.g., "987654321@g.us")
	 * @returns boolean indicating if the user is an admin in the group
	 */
	async isUserAdmin(
		userWhatsappId: string,
		groupWhatsappId: string
	): Promise<boolean> {
		// Get the user by WhatsApp ID
		const user = await userRepository.getByWaId(userWhatsappId);
		if (!user) {
			return false;
		}

		// Get the group by WhatsApp ID
		const group = await groupRepository.getByWaId(groupWhatsappId);
		if (!group) {
			return false;
		}

		// Get the membership
		const membership = await groupMembershipRepository.getByUserAndGroup({
			userId: user.id,
			groupId: group.id,
		});

		if (!membership) {
			return false;
		}

		// Check if role is ADMIN
		return membership.role === 'ADMIN';
	},

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

	/**
	 * Get members with a specific role in a group
	 */
	async getMembersByRole({
		groupWhatsappId,
		role,
	}: {
		groupWhatsappId: string;
		role: MembershipRole;
	}) {
		// Get group by WhatsApp ID
		const group = await groupRepository.getByWaId(groupWhatsappId);
		if (!group) {
			throw AppError.notFound('Group not found');
		}

		// Get members with the specified role
		return groupMembershipRepository.listByGroupIdAndRole(group.id, role);
	},
};
