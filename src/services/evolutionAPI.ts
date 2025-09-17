import config from '@config';
import { GroupAction } from '@constants/evolutionConstants';
import { handleAxiosError } from '@utils/errorHandler';
import axios from 'axios';
import type {
	RemoveMembersRequest,
	SendTextRequest,
} from '../types/evolution.d';

const BASE_URL = config.evolutionApiUrl;
const API_KEY = config.evolutionApiKey;
const INSTANCE = config.instance;

export const evolutionAPI = {
	sendMessage: async (to: string, message: string) => {
		const payload: SendTextRequest = {
			number: to,
			text: message,
		};

		try {
			await axios.post(`${BASE_URL}/message/sendText/${INSTANCE}`, payload, {
				headers: {
					apikey: API_KEY,
				},
			});
		} catch (err: unknown) {
			handleAxiosError(err);
		}
	},

	removeMembers: async (phoneNumbersToRemove: string[], groupWaId: string) => {
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
};
