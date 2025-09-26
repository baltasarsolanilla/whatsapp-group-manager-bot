import {
	blacklistRepository,
	groupRepository,
	userRepository,
} from '@database/repositories';
import { formatWhatsappId } from '@logic/helpers';
import { AppError } from '@utils/AppError';
import { createMemberListService } from './baseMemberListService';

// Enhanced blacklist service with auto-removal functionality
const baseBlacklistService = createMemberListService(
	blacklistRepository,
	'blacklist'
);

// Enhanced service with additional methods
export const blacklistService = {
	...baseBlacklistService,

	/**
	 * Check if a user is blacklisted in a specific group
	 * @param whatsappId The user's WhatsApp ID (e.g., "69918158549171@lid")
	 * @param groupWaId The group's WhatsApp ID (e.g., "120363403645737238@g.us")
	 * @returns Promise<boolean> true if user is blacklisted, false otherwise
	 */
	async isBlacklisted(whatsappId: string, groupWaId: string): Promise<boolean> {
		try {
			const user = await userRepository.getByWaId(whatsappId);
			const group = await groupRepository.getByWaId(groupWaId);

			if (!user || !group) {
				return false; // If user or group doesn't exist, they can't be blacklisted
			}

			// Check if there's a blacklist entry for this user in this group
			const blacklistEntries = await blacklistRepository.list(group.id);
			return blacklistEntries.some(
				(entry: { user?: { whatsappId?: string } }) => 
					entry.user?.whatsappId === whatsappId
			);
		} catch (error) {
			console.warn(`Error checking blacklist status for ${whatsappId}:`, error);
			return false; // Default to not blacklisted on error
		}
	},

	async addToBlacklistWithRemoval(
		phoneNumber: string,
		groupWaId: string,
		skipRemoval: boolean = false
	) {
		const whatsappPn = formatWhatsappId(phoneNumber);
		const user = await userRepository.getByPn(whatsappPn);
		const group = await groupRepository.getByWaId(groupWaId);

		if (!group || !user) {
			const warnMsg = `blacklistService.addToBlacklistWithRemoval() - ${!group ? 'Group' : 'User'} not found`;
			console.warn(warnMsg);
			throw AppError.notFound('Group or user not found');
		}

		// Start database transaction-like operation
		// Add to blacklist first (this is the primary operation)
		const blacklistEntry = await blacklistRepository.upsert(user.id, group.id);

		// Initialize removal results
		const removalResults: {
			success: boolean;
			error?: string;
			groupWaId: string;
		} = {
			success: false,
			groupWaId,
		};

		// If skipRemoval is false, attempt removal from WhatsApp group
		if (!skipRemoval) {
			try {
				console.log('Skipping actual removal in demo code');
				// await evolutionAPI.groupService.removeMembers(
				// 	[extractPhoneNumberFromWhatsappPn(whatsappPn)],
				// 	groupWaId
				// );
				removalResults.success = true;
			} catch (error) {
				// Log the error but don't fail the blacklist operation
				console.warn(
					`Failed to remove user ${phoneNumber} from group ${groupWaId}:`,
					error
				);
				removalResults.success = false;
				removalResults.error =
					error instanceof Error
						? error.message
						: 'Unknown error during removal';
			}
		} else {
			// Removal was skipped
			removalResults.success = true; // Consider skipped as successful
		}

		return {
			blacklistEntry,
			removalResults,
			skipRemoval,
		};
	},
};
