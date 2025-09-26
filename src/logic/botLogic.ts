import { EVOLUTION_EVENTS } from '@constants/evolutionConstants';
import { messageService, groupService } from '@logic/services';
import { userRepository, groupMembershipRepository } from '@database/repositories';
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
	if (!data || !data.id || !data.action || !data.participants) {
		console.error('❌ Invalid webhook data: missing required fields', data);
		return;
	}

	// Only process "add" and "remove" actions
	if (data.action !== 'add' && data.action !== 'remove') {
		console.log(`⏭️  Skipping group participants update with action: ${data.action}`);
		return;
	}

	// Skip if no participants to process
	if (!Array.isArray(data.participants) || data.participants.length === 0) {
		console.log('⚠️  No participants to process');
		return;
	}

	try {
		// Ensure group exists or fetch from Evolution API
		const group = await groupService.ensure(data.id);
		if (!group) {
			console.warn(`❌ Group not found and could not be fetched: ${data.id}`);
			return;
		}

		console.log(`📊 Processing ${data.participants.length} participant(s) for ${data.action} operation`);

		// Process each participant
		for (const participantId of data.participants) {
			if (!participantId || typeof participantId !== 'string') {
				console.warn(`⚠️  Invalid participant ID: ${participantId}`);
				continue;
			}

			try {
				if (data.action === 'add') {
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
				} else if (data.action === 'remove') {
					// Find user by whatsappId
					const user = await userRepository.getByWaId(participantId);
					if (user) {
						await groupMembershipRepository.removeByUserAndGroup({
							userId: user.id,
							groupId: group.id,
						});

						console.log(`✅ Removed user ${participantId} from group ${data.id}`);
					} else {
						console.warn(`⚠️  User not found for removal: ${participantId}`);
					}
				}
			} catch (participantError) {
				console.error(`❌ Error processing participant ${participantId}:`, participantError);
				// Continue processing other participants
			}
		}

		console.log(`🎉 Completed processing group participants update for group ${data.id}`);
	} catch (error) {
		console.error('❌ Error handling group participants update:', error);
	}
};
