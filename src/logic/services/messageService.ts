import {
	groupMembershipRepository,
	messageRepository,
	userRepository,
} from '@database/repositories';
import { AppError } from '@utils/AppError';
import { MessageUpsert } from 'types/evolution';
import { messageMapper, msgGroupMapper, msgUserMapper } from './../mappers';
import { groupService } from './groupService';
import { blacklistService } from './blacklistService';
import { evolutionAPI } from '@services/evolutionAPI';
import { FeatureFlag, FeatureFlagService } from '../../featureFlags';

export const messageService = {
	async ensureGroupMessageUpsert(payload: MessageUpsert) {
		// 1. Ensure group
		const group = await groupService.ensure(msgGroupMapper.id(payload));

		if (!group) {
			throw AppError.notFound('Group not found');
		}

		// 2. Ensure user
		const user = await userRepository.upsert({
			whatsappId: msgUserMapper.id(payload),
			whatsappPn: msgUserMapper.pn(payload) ?? undefined,
			name: msgUserMapper.name(payload),
		});

		// 3. Ensure membership & update lastActiveAt to keep track of activity
		const membership = await groupMembershipRepository.upsert({
			user,
			group,
		});

		// 4. Ensure message
		const message = await messageRepository.add({
			user,
			group,
			whatsappId: messageMapper.id(payload),
			messageType: messageMapper.type(payload),
			messageTimestamp: messageMapper.timestamp(payload),
		});

		// 5. Check if user is blacklisted and delete message if so
		const isBlacklisted = await blacklistService.isBlacklisted(
			msgUserMapper.id(payload),
			msgGroupMapper.id(payload)
		);

		if (isBlacklisted) {
			console.log(
				`🚫 User ${msgUserMapper.id(payload)} is blacklisted. Deleting message ${messageMapper.id(payload)}...`
			);

			// Check BLACKLIST_AUTO_REMOVAL feature flag before deleting message
			if (FeatureFlagService.isEnabled(FeatureFlag.BLACKLIST_AUTO_REMOVAL)) {
				try {
					await evolutionAPI.messageService.deleteMessageForEveryone(
						messageMapper.id(payload),
						msgGroupMapper.id(payload)
					);
					console.log(
						`✅ Successfully deleted message ${messageMapper.id(payload)} from blacklisted user`
					);
				} catch (error) {
					console.error(
						`❌ Failed to delete message ${messageMapper.id(payload)} from blacklisted user:`,
						error
					);
				}
			} else {
				console.log(
					`🔒 BLACKLIST_AUTO_REMOVAL feature flag is disabled. Skipping message deletion for user ${msgUserMapper.id(payload)}`
				);
			}
		}

		return { user, group, membership, message };
	},
};
