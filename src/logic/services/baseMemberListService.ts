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
async function resolveUser(
	phoneNumber?: string,
	whatsappId?: string
): Promise<User | null> {
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
		return await userRepository.getByWaId(whatsappId);
	}

	// phoneNumber path
	const whatsappPn = formatWhatsappId(phoneNumber!);
	return await userRepository.getByPn(whatsappPn);
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

			if (!group || !user) {
				const warnMsg = `${entityName}Service.add() - ${!group ? 'Group' : 'User'} not found`;
				// eslint-disable-next-line no-console
				console.warn(warnMsg);
				throw AppError.notFound('Group or user not found');
			}

			return await repository.upsert(user.id, group.id);
		},

		async remove({ phoneNumber, whatsappId, groupWaId }) {
			const user = await resolveUser(phoneNumber, whatsappId);
			const group = await groupRepository.getByWaId(groupWaId);

			if (!group || !user) {
				const warnMsg = `${entityName}Service.remove() - ${!group ? 'Group' : 'User'} not found`;
				// eslint-disable-next-line no-console
				console.warn(warnMsg);
				throw AppError.notFound('Group or user not found');
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
