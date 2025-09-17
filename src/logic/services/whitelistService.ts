import { getGroupByWaId } from '@database/repositories/groupRepository';
import { getUserByPn } from '@database/repositories/userRepository';
import { whitelistRepository } from '@database/repositories/whitelistRepository';
import { formatWhatsappId } from '@logic/helpers';

export const whitelistService = {
	async add(phoneNumber: string, groupWaId: string) {
		const whatsappPn = formatWhatsappId(phoneNumber);
		const user = await getUserByPn(whatsappPn);
		const group = await getGroupByWaId(groupWaId);

		if (!group || !user) {
			const warnMsg = `whitelistService.add() - ${!group ? 'Group' : 'User'} not found`;
			console.warn(warnMsg);
			return;
		}

		return await whitelistRepository.add(user.id, group.id);
	},

	async remove(phoneNumber: string, groupWaId: string) {
		const whatsappPn = formatWhatsappId(phoneNumber);
		const user = await getUserByPn(whatsappPn);
		const group = await getGroupByWaId(groupWaId);

		if (!group || !user) {
			const warnMsg = `whitelistService.add() - ${!group ? 'Group' : 'User'} not found`;
			console.warn(warnMsg);
			return;
		}

		return await whitelistRepository.remove(user.id, group.id);
	},

	async list(groupWaId?: string) {
		const groupId = groupWaId
			? (await getGroupByWaId(groupWaId))?.id
			: undefined;
		return whitelistRepository.list(groupId);
	},
};
