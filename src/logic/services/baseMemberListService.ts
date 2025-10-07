import { groupRepository, userRepository } from '@database/repositories';
import { formatWhatsappId, isUserWhatsappId } from '@logic/helpers';
import { AppError } from '@utils/AppError';
import type { User } from '@prisma/client';

// Generic interface for member list repository operations
interface IMemberListRepository {
	upsert(userId: string, groupId: string): Promise<unknown>;
	list(groupId?: string): Promise<unknown[]>;
	remove(userId: string, groupId: string): Promise<unknown>;
}

// Generic interface for member list service operations
interface IMemberListService {
	add(params: {
		phoneNumber?: string;
		whatsappId?: string;
		groupWaId: string;
	}): Promise<unknown>;
	remove(params: {
		phoneNumber?: string;
		whatsappId?: string;
		groupWaId: string;
	}): Promise<unknown>;
	list(groupWaId?: string): Promise<unknown[]>;
}

// Helper function to resolve user from either phoneNumber or whatsappId
// If user doesn't exist, it will be created
export async function resolveUser(
	phoneNumber?: string,
	whatsappId?: string
): Promise<User> {
	if (phoneNumber && whatsappId) {
		throw AppError.badRequest(
			'Provide either phoneNumber or whatsappId, not both'
		);
	}

	if (!phoneNumber && !whatsappId) {
		throw AppError.required('Either phoneNumber or whatsappId is required');
	}

	if (whatsappId) {
		// Validate that whatsappId has the correct format
		if (!isUserWhatsappId(whatsappId)) {
			throw AppError.badRequest(
				'Invalid whatsappId format. Expected format: xxxxx@lid'
			);
		}
		
		// Try to find existing user by whatsappId, create if not found
		const user =
			(await userRepository.getByWaId(whatsappId)) ??
			(await userRepository.createByWaId(whatsappId));
		
		return user;
	}

	// phoneNumber path
	const whatsappPn = formatWhatsappId(phoneNumber!);
	
	// Try to find existing user by phoneNumber, create if not found
	const user =
		(await userRepository.getByPn(whatsappPn)) ??
		(await userRepository.createByPn(whatsappPn));
	
	return user;
}

// Generic service factory
export function createMemberListService(
	repository: IMemberListRepository,
	entityName: string
): IMemberListService {
	return {
		async add({ phoneNumber, whatsappId, groupWaId }) {
			const user = await resolveUser(phoneNumber, whatsappId);
			const group = await groupRepository.getByWaId(groupWaId);

			if (!group) {
				const warnMsg = `${entityName}Service.add() - Group not found`;
				// eslint-disable-next-line no-console
				console.warn(warnMsg);
				throw AppError.notFound('Group not found');
			}

			return await repository.upsert(user.id, group.id);
		},

		async remove({ phoneNumber, whatsappId, groupWaId }) {
			const user = await resolveUser(phoneNumber, whatsappId);
			const group = await groupRepository.getByWaId(groupWaId);

			if (!group) {
				const warnMsg = `${entityName}Service.remove() - Group not found`;
				// eslint-disable-next-line no-console
				console.warn(warnMsg);
				throw AppError.notFound('Group not found');
			}

			return await repository.remove(user.id, group.id);
		},

		async list(groupWaId?: string) {
			const groupId = groupWaId
				? (await groupRepository.getByWaId(groupWaId))?.id
				: undefined;
			return repository.list(groupId);
		},
	};
}
