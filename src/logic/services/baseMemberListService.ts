import { groupRepository, userRepository } from '@database/repositories';
import { formatWhatsappId } from '@logic/helpers';
import { AppError } from '@utils/AppError';

// Generic interface for member list repository operations
interface IMemberListRepository {
	upsert(userId: string, groupId: string): Promise<any>;
	list(groupId?: string): Promise<any[]>;
	remove(userId: string, groupId: string): Promise<any>;
}

// Generic interface for member list service operations
interface IMemberListService {
	add(phoneNumber: string, groupWaId: string): Promise<any>;
	remove(phoneNumber: string, groupWaId: string): Promise<any>;
	list(groupWaId?: string): Promise<any[]>;
}

// Generic service factory
export function createMemberListService(
	repository: IMemberListRepository,
	entityName: string
): IMemberListService {
	return {
		async add(phoneNumber: string, groupWaId: string) {
			const whatsappPn = formatWhatsappId(phoneNumber);
			const user = await userRepository.getByPn(whatsappPn);
			const group = await groupRepository.getByWaId(groupWaId);

			if (!group || !user) {
				const warnMsg = `${entityName}Service.add() - ${!group ? 'Group' : 'User'} not found`;
				console.warn(warnMsg);
				throw AppError.notFound('Group or user not found');
			}

			return await repository.upsert(user.id, group.id);
		},

		async remove(phoneNumber: string, groupWaId: string) {
			const whatsappPn = formatWhatsappId(phoneNumber);
			const user = await userRepository.getByPn(whatsappPn);
			const group = await groupRepository.getByWaId(groupWaId);

			if (!group || !user) {
				const warnMsg = `${entityName}Service.remove() - ${!group ? 'Group' : 'User'} not found`;
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