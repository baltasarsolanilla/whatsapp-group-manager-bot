import { EVOLUTION_EVENTS, GroupAction } from '@constants/evolutionConstants';
import { BLACKLIST_EMOJI } from '@constants/messagesConstants';
import config from '@config';
import {
	groupMembershipRepository,
	userRepository,
} from '@database/repositories';
import {
	blacklistService,
	groupService,
	messageService,
} from '@logic/services';
import { Group } from '@prisma/client';
import { evolutionAPI } from '@services/evolutionAPI';
import { AppError } from '@utils/AppError';
import type { WebhookEvent, MessageUpsert } from 'types/evolution';
import { isGroupMessage, isUserAdmin } from './helpers';
import { FeatureFlag, FeatureFlagService } from '../featureFlags';

export const handleMessageUpsert = async (
	update: WebhookEvent<typeof EVOLUTION_EVENTS.MESSAGES_UPSERT>
) => {
	const { data } = update;

	if (isGroupMessage(data)) {
		console.log('🚀 ~ handleMessageUpsert ~ update:', update);

		// Check if this is a reaction message
		if (
			data.messageType === 'reactionMessage' &&
			data.message?.reactionMessage
		) {
			await handleReactionMessage(data);
		}

		await messageService.ensureGroupMessageUpsert(data);
	}
};

export const handleGroupParticipantsUpdate = async (
	update: WebhookEvent<typeof EVOLUTION_EVENTS.GROUP_PARTICIPANTS_UPDATE>
) => {
	const { data } = update;
	console.log('🚀 ~ handleGroupParticipantsUpdate ~ update:', update);

	// Validate required fields
	if (!data?.id || !data.action || !data.participants) {
		throw AppError.required('Invalid webhook data: missing required fields');
	}

	// Only process "add" and "remove" actions
	if (data.action !== GroupAction.ADD && data.action !== GroupAction.REMOVE) {
		throw new AppError(
			`Unsupported group participants action: ${data.action}`,
			400
		);
	}

	if (!Array.isArray(data.participants) || data.participants.length === 0) {
		throw AppError.required('No participants to process');
	}

	try {
		const group = await groupService.ensure(data.id);
		if (!group) {
			throw AppError.notFound(`Group not found: ${data.id}`);
		}

		console.log(
			`📊 Processing ${data.participants.length} participant(s) for ${data.action} operation`
		);

		for (const participantId of data.participants) {
			if (!participantId || typeof participantId !== 'string') {
				console.warn(`⚠️  Invalid participant ID: ${participantId}`);
				continue;
			}

			try {
				if (data.action === GroupAction.ADD) {
					await handleAddParticipant(participantId, data.id, group);
				} else if (data.action === GroupAction.REMOVE) {
					await handleRemoveParticipant(participantId, data.id, group);
				}
			} catch (participantError) {
				console.error(
					`❌ Error processing participant ${participantId}:`,
					participantError
				);
			}
		}

		console.log(
			`🎉 Completed processing group participants update for group ${data.id}`
		);
	} catch (error) {
		console.error('❌ Error handling group participants update:', error);
	}
};

/**
 * Handle reaction messages, specifically for blacklisting users via 🚫 emoji
 */
async function handleReactionMessage(data: MessageUpsert) {
	const reactionMessage = data.message?.reactionMessage;
	if (!reactionMessage) {
		return;
	}

	const { text, key: reactionKey } = reactionMessage;
	const groupWaId = data.key.remoteJid;
	const reactorWaId = data.key.participant; // Admin who reacted
	const targetUserWaId = reactionKey.participant; // User to blacklist

	console.log(
		`📱 Reaction detected: ${text} by ${reactorWaId} on message from ${targetUserWaId} in group ${groupWaId}`
	);

	try {
		// Fetch group data to verify admin status
		const groupData = await evolutionAPI.groupService.fetchGroup(groupWaId);
		if (!groupData) {
			console.warn(
				`⚠️  Could not fetch group data for ${groupWaId}, skipping blacklist action`
			);
			return;
		}

		// Verify bot user is also an admin
		if (!config.waBaltiId) {
			console.warn('⚠️  Bot WhatsApp ID (waBaltiId) not configured');
			return;
		}

		if (!isUserAdmin(config.waBaltiId, groupData)) {
			console.log(
				`⚠️  Bot user ${config.waBaltiId} is not an admin in this group, skipping blacklist action`
			);
			return;
		}

		// Only process blacklist emoji
		if (text !== BLACKLIST_EMOJI) {
			console.log(
				`⏭️  Ignoring reaction - not blacklist emoji. Received: ${text}`
			);
			return;
		}

		console.log(`🚫 Blacklist emoji detected from ${reactorWaId}`);

		// Verify reactor is an admin
		if (!isUserAdmin(reactorWaId, groupData)) {
			console.log(
				`⚠️  User ${reactorWaId} is not an admin, ignoring blacklist reaction`
			);
			return;
		}

		console.log(
			`✅ Admin verified: ${reactorWaId} is authorized to blacklist users`
		);

		// Ensure group exists in database
		await groupService.ensure(groupWaId);

		// Add target user to blacklist
		console.log(
			`🚫 Adding user ${targetUserWaId} to blacklist in group ${groupWaId}`
		);

		await blacklistService.addToBlacklistWithRemoval(
			undefined, // phoneNumber not needed
			targetUserWaId, // whatsappId
			groupWaId,
			false // skipRemoval - will remove user from group
		);

		console.log(
			`✅ Successfully blacklisted user ${targetUserWaId} in group ${groupWaId}`
		);
	} catch (error) {
		console.error(
			`❌ Error processing blacklist reaction for user ${targetUserWaId}:`,
			error
		);
	}
}

async function handleAddParticipant(
	participantId: string,
	groupId: string,
	group: Group
) {
	const isBlacklisted = await blacklistService.isBlacklisted(
		participantId,
		groupId
	);

	if (isBlacklisted) {
		console.log(
			`🚫 User ${participantId} is blacklisted for group ${groupId}. Removing user...`
		);

		// Check BLACKLIST_AUTO_REMOVAL feature flag before removing
		if (FeatureFlagService.isEnabled(FeatureFlag.BLACKLIST_AUTO_REMOVAL)) {
			try {
				await evolutionAPI.groupService.removeMembers([participantId], groupId);
				console.log(
					`✅ Successfully removed blacklisted user ${participantId} from group ${groupId}`
				);
			} catch (removalError) {
				console.error(
					`❌ Failed to remove blacklisted user ${participantId} from group ${groupId}:`,
					removalError
				);
			}
		} else {
			console.log(
				`🔒 BLACKLIST_AUTO_REMOVAL feature flag is disabled. Skipping removal of user ${participantId}`
			);
		}

		console.log(
			`⏭️  Skipping membership tracking for blacklisted user ${participantId}`
		);
		return;
	}

	const user = await userRepository.upsert({
		whatsappId: participantId,
		whatsappPn: participantId,
	});

	await groupMembershipRepository.upsert({
		user,
		group,
	});

	console.log(`✅ Added user ${participantId} to group ${groupId}`);
}

async function handleRemoveParticipant(
	participantId: string,
	groupId: string,
	group: Group
) {
	const user = await userRepository.getByWaId(participantId);
	if (user) {
		await groupMembershipRepository.removeByUserAndGroup({
			userId: user.id,
			groupId: group.id,
		});
		console.log(`✅ Removed user ${participantId} from group ${groupId}`);
	} else {
		console.warn(`⚠️  User not found for removal: ${participantId}`);
	}
}
