import {
	blacklistRepository,
	groupRepository,
	userRepository,
} from '@database/repositories';
import { formatWhatsappId } from '@logic/helpers';
import { AppError } from '@utils/AppError';

export const blacklistService = {
	async add(phoneNumber: string, groupWaId: string) {
		const whatsappPn = formatWhatsappId(phoneNumber);
		const user = await userRepository.getByPn(whatsappPn);
		const group = await groupRepository.getByWaId(groupWaId);

		if (!group || !user) {
			const warnMsg = `blacklistService.add() - ${!group ? 'Group' : 'User'} not found`;
			console.warn(warnMsg);
			throw AppError.notFound('Group or user not found');
		}

		return await blacklistRepository.upsert(user.id, group.id);
	},

	async remove(phoneNumber: string, groupWaId: string) {
		const whatsappPn = formatWhatsappId(phoneNumber);
		const user = await userRepository.getByPn(whatsappPn);
		const group = await groupRepository.getByWaId(groupWaId);

		if (!group || !user) {
			const warnMsg = `blacklistService.add() - ${!group ? 'Group' : 'User'} not found`;
			console.warn(warnMsg);
			throw AppError.notFound('Group or user not found');
		}

		return await blacklistRepository.remove(user.id, group.id);
	},

	async list(groupWaId?: string) {
		const groupId = groupWaId
			? (await groupRepository.getByWaId(groupWaId))?.id
			: undefined;
		return blacklistRepository.list(groupId);
	},
};
