import { EVOLUTION_EVENTS, GroupAction } from '@constants/evolutionConstants';
import {
	messageService,
	groupService,
	blacklistService,
} from '@logic/services';
import {
	userRepository,
	groupMembershipRepository,
} from '@database/repositories';
import { AppError } from '@utils/AppError';
import { evolutionAPI } from '@services/evolutionAPI';
import type { WebhookEvent } from 'types/evolution';
import { isGroupMessage } from './helpers';

export const handleMessageUpsert = async (
	update: WebhookEvent<typeof EVOLUTION_EVENTS.MESSAGES_UPSERT>
) => {
	const { data } = update;

	if (isGroupMessage(data)) {
		console.log('🚀 ~ handleMessageUpsert ~ update:', update);
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

	// Skip if no participants to process
	if (!Array.isArray(data.participants) || data.participants.length === 0) {
		throw AppError.required('No participants to process');
	}

	try {
		// Ensure group exists or fetch from Evolution API
		const group = await groupService.ensure(data.id);
		if (!group) {
			throw AppError.notFound(`Group not found: ${data.id}`);
		}

		console.log(
			`📊 Processing ${data.participants.length} participant(s) for ${data.action} operation`
		);

		// Process each participant
		for (const participantId of data.participants) {
			if (!participantId || typeof participantId !== 'string') {
				console.warn(`⚠️  Invalid participant ID: ${participantId}`);
				continue;
			}

			try {
				if (data.action === GroupAction.ADD) {
					// Check if user is blacklisted before processing
					const isBlacklisted = await blacklistService.isBlacklisted(
						participantId,
						data.id
					);

					if (isBlacklisted) {
						console.log(
							`🚫 User ${participantId} is blacklisted for group ${data.id}. Removing user...`
						);

						try {
							// Remove user from WhatsApp group using Evolution API
							await evolutionAPI.groupService.removeMembers(
								[participantId],
								data.id
							);
							console.log(
								`✅ Successfully removed blacklisted user ${participantId} from group ${data.id}`
							);
						} catch (removalError) {
							console.error(
								`❌ Failed to remove blacklisted user ${participantId} from group ${data.id}:`,
								removalError
							);
							// Continue processing other participants even if removal fails
						}

						// DO NOT add to membership tracking for blacklisted users
						console.log(
							`⏭️  Skipping membership tracking for blacklisted user ${participantId}`
						);
					} else {
						// User is not blacklisted, proceed with normal flow
						// Ensure user exists and add to group membership
						const user = await userRepository.upsert({
							whatsappId: participantId,
							whatsappPn: participantId, // Using participantId as both id and phone number
						});

						await groupMembershipRepository.upsert({
							user,
							group,
						});

						console.log(`✅ Added user ${participantId} to group ${data.id}`);
					}
				} else if (data.action === GroupAction.REMOVE) {
					// Find user by whatsappId
					const user = await userRepository.getByWaId(participantId);
					if (user) {
						await groupMembershipRepository.removeByUserAndGroup({
							userId: user.id,
							groupId: group.id,
						});

						console.log(
							`✅ Removed user ${participantId} from group ${data.id}`
						);
					} else {
						console.warn(`⚠️  User not found for removal: ${participantId}`);
					}
				}
			} catch (participantError) {
				console.error(
					`❌ Error processing participant ${participantId}:`,
					participantError
				);
				// Continue processing other participants
			}
		}

		console.log(
			`🎉 Completed processing group participants update for group ${data.id}`
		);
	} catch (error) {
		console.error('❌ Error handling group participants update:', error);
	}
};
