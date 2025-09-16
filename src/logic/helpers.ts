import {
	WHATSAPP_GROUP_SUFFIX,
	WHATSAPP_PERSONAL_SUFFIX,
} from '@constants/messages';
import type { MessageUpsert } from 'types/evolution';
import { groupMapper, userMapper } from './mappers';

export const isGroupMessage = (payload: MessageUpsert) => {
	return payload.key.remoteJid.endsWith(WHATSAPP_GROUP_SUFFIX);
};

export const isPrivateMessage = (data: MessageUpsert) => {
	return data.key.remoteJid.endsWith(WHATSAPP_PERSONAL_SUFFIX);
};

const extractUserFromGroupUpdate = (payload: MessageUpsert) => {
	return {
		whatsappId: userMapper.id(payload),
		whatsappPn: userMapper.pn(payload),
		name: userMapper.name(payload),
	};
};

export const extractUserFromUpdate = (payload: MessageUpsert) => {
	if (isGroupMessage(payload)) {
		return extractUserFromGroupUpdate(payload);
	}

	return false;
};

export const extractGroupFromUpdate = (payload: MessageUpsert) => {
	if (isGroupMessage(payload)) {
		return { whatsappId: groupMapper.id(payload), name: 'unknown' };
	}

	return false;
};
