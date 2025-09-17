import { blacklistRepository } from '@database/repositories/blacklistRepository';
import { groupRepository } from '@database/repositories/groupRepository';
import { userRepository } from '@database/repositories/userRepository';
import { formatWhatsappId } from '@logic/helpers';

export const blacklistService = {
	async add(phoneNumber: string, groupWaId: string) {
		const whatsappPn = formatWhatsappId(phoneNumber);
		const user = await userRepository.getByPn(whatsappPn);
		const group = await groupRepository.getByWaId(groupWaId);

		if (!group || !user) {
			const warnMsg = `blacklistService.add() - ${!group ? 'Group' : 'User'} not found`;
			console.warn(warnMsg);
			return;
		}

		return await blacklistRepository.add(user.id, group.id);
	},

	async remove(phoneNumber: string, groupWaId: string) {
		const whatsappPn = formatWhatsappId(phoneNumber);
		const user = await userRepository.getByPn(whatsappPn);
		const group = await groupRepository.getByWaId(groupWaId);

		if (!group || !user) {
			const warnMsg = `blacklistService.add() - ${!group ? 'Group' : 'User'} not found`;
			console.warn(warnMsg);
			return;
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
