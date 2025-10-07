import { groupRepository } from '@database/repositories/groupRepository';
import { groupMembershipRepository } from '@database/repositories/groupMembershipRepository';
import { userRepository } from '@database/repositories/userRepository';

/**
 * Check if a user is an admin in a specified group by WhatsApp IDs
 * @param userWhatsappId - The WhatsApp user ID (e.g., "123456789@s.whatsapp.net")
 * @param groupWhatsappId - The WhatsApp group ID (e.g., "987654321@g.us")
 * @returns boolean indicating if the user is an admin in the group
 */
export async function isUserAdmin(
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
}
