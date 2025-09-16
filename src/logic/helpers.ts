import {
	WHATSAPP_GROUP_SUFFIX,
	WHATSAPP_PERSONAL_SUFFIX,
} from '@constants/messages';
import type { MessageUpsert } from 'types/evolution';

export const isGroupMessage = (payload: MessageUpsert) => {
	return payload.key.remoteJid.endsWith(WHATSAPP_GROUP_SUFFIX);
};

export const isPrivateMessage = (data: MessageUpsert) => {
	return data.key.remoteJid.endsWith(WHATSAPP_PERSONAL_SUFFIX);
};

const extractUserFromGroupUpdate = (payload: MessageUpsert) => {
	return {
		whatsappId: payload.key.participant,
		whatsappPn: payload.key.participantPn ?? undefined,
		name: payload.pushName,
	};
};

export const extractUserFromUpdate = (payload: MessageUpsert) => {
	if (isGroupMessage(payload)) {
		return extractUserFromGroupUpdate(payload);
	}

	return false;

	// TODO: handle isPrivateMessage
};
