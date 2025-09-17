import config from '@config';
import { handleAxiosError } from '@utils/errorHandler';
import axios from 'axios';
import type { SendTextRequest } from '../types/evolution.d';

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

	removeMember: async (userId: string, groupId: string) => {
		console.log('REMOVE MEMBER', userId, groupId);
		return true;
	},
};
