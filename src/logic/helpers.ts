import {
	WHATSAPP_GROUP_SUFFIX,
	WHATSAPP_PERSONAL_SUFFIX,
} from '@constants/messagesConstants';
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

// Format plain phone number to create a whatsappPn
// e.g. "+61xxxxxxxxx" => "61xxxxxxxxx@s.whatsapp.net"
export const formatWhatsappId = (phoneNumber: string) => {
	// Remove leading '+' if it exists
	const normalized = phoneNumber.startsWith('+')
		? phoneNumber.slice(1)
		: phoneNumber;

	// Append the suffix
	return `${normalized}${WHATSAPP_PERSONAL_SUFFIX}`;
};

// Extract phone number from whatsappPn
// e.g. "61xxxxxxxxx@s.whatsapp.net" => "+61xxxxxxxxx"
export const extractPhoneNumberFromWhatsappPn = (whatsappPn: string | null) => {
	if (whatsappPn?.endsWith(WHATSAPP_PERSONAL_SUFFIX)) {
		const number = whatsappPn.slice(0, -WHATSAPP_PERSONAL_SUFFIX.length);
		return `+${number}`;
	}
	return '';
};
