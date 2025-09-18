import { GroupAction } from '@constants/evolutionConstants';
import { handleAxiosError } from '@utils/errorHandler';
import axios from 'axios';
import type { RemoveMembersRequest } from 'types/evolution';
import { API_CONFIG_TYPE } from './evolutionAPI';

export const createGroupService = ({
	BASE_URL,
	API_KEY,
	INSTANCE,
}: API_CONFIG_TYPE) => {
	return {
		removeMembers: async (
			phoneNumbersToRemove: string[],
			groupWaId: string
		) => {
			const payload: RemoveMembersRequest = {
				action: GroupAction.REMOVE,
				participants: phoneNumbersToRemove,
			};

			try {
				await axios.post(
					`${BASE_URL}/group/updateParticipant/${INSTANCE}/?groupJid=${groupWaId}`,
					payload,
					{
						headers: {
							apikey: API_KEY,
						},
					}
				);
			} catch (err: unknown) {
				handleAxiosError(err);
			}
		},
		fetchGroupByWaId: async (groupWaId: string) => {
			try {
				const res = await axios.get(
					`${BASE_URL}/group/findGroupInfos/${INSTANCE}/?groupJid=${groupWaId}`,
					{
						headers: {
							apikey: API_KEY,
						},
					}
				);
				console.log(res);
			} catch (err: unknown) {
				handleAxiosError(err);
			}
		},
	};
};
