import { blacklistRepository } from '@database/repositories/blacklistRepository';
import { getGroupByWaId } from '@database/repositories/groupRepository';
import { getUserByPn } from '@database/repositories/userRepository';
import { formatWhatsappId } from '@logic/helpers';

export const blacklistService = {
	async add(phoneNumber: string, groupWaId: string) {
		const whatsappPn = formatWhatsappId(phoneNumber);
		const user = await getUserByPn(whatsappPn);
		const group = await getGroupByWaId(groupWaId);

		if (!group || !user) {
			const warnMsg = `blacklistService.add() - ${!group ? 'Group' : 'User'} not found`;
			console.warn(warnMsg);
			return;
		}

		return await blacklistRepository.add(user.id, group.id);
	},

	async remove(phoneNumber: string, groupWaId: string) {
		const whatsappPn = formatWhatsappId(phoneNumber);
		const user = await getUserByPn(whatsappPn);
		const group = await getGroupByWaId(groupWaId);

		if (!group || !user) {
			const warnMsg = `blacklistService.add() - ${!group ? 'Group' : 'User'} not found`;
			console.warn(warnMsg);
			return;
		}

		return await blacklistRepository.remove(user.id, group.id);
	},

	async list(groupWaId?: string) {
		const groupId = groupWaId
			? (await getGroupByWaId(groupWaId))?.id
			: undefined;
		return blacklistRepository.list(groupId);
	},
};
