import config from '@config';
import axios from 'axios';
import { handleAxiosError } from 'utils/errorHandler';
import { type SendTextRequest } from '../types/evolution.d';

const BASE_URL = config.evolutionApiUrl;
const API_KEY = config.evolutionApiKey;
const INSTANCE = config.instance;

export const sendMessage = async (to: string, message: string) => {
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
};
