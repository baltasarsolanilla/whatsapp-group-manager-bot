import { EVOLUTION_EVENTS, GroupAction } from '@constants/evolutionConstants';
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
