import { handleAxiosError } from '@utils/errorHandler';
import axios from 'axios';
import type { DeleteMessageRequest, SendTextRequest } from 'types/evolution';
import { API_CONFIG_TYPE } from './evolutionAPI';

export const createMessageService = ({
	BASE_URL,
	API_KEY,
	INSTANCE,
}: API_CONFIG_TYPE) => {
	return {
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
		deleteMessageForEveryone: async (messageId: string, groupId: string) => {
			const payload: DeleteMessageRequest = {
				id: messageId,
				remoteJid: groupId,
				fromMe: true,
				participant: '',
			};

			try {
				await axios.delete(
					`${BASE_URL}/chat/deleteMessageForEveryone/${INSTANCE}`,
					{
						headers: {
							apikey: API_KEY,
						},
						data: payload,
					}
				);
			} catch (err: unknown) {
				handleAxiosError(err);
			}
		},
	};
};
