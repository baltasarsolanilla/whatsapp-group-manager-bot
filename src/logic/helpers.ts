import {
	WHATSAPP_GROUP_ID_SUFFIX,
	WHATSAPP_USER_PN_SUFFIX,
} from '@constants/messagesConstants';
import type { MessageUpsert } from 'types/evolution';

export const isGroupMessage = (payload: MessageUpsert) => {
	return payload.key.remoteJid.endsWith(WHATSAPP_GROUP_ID_SUFFIX);
};

export const isPrivateMessage = (data: MessageUpsert) => {
	return data.key.remoteJid.endsWith(WHATSAPP_USER_PN_SUFFIX);
};

export const isUserWhatsappPn = (pn: string) => {
	return pn.endsWith(WHATSAPP_USER_PN_SUFFIX);
};

export const isUserWhatsappId = (id: string) => {
	return id.endsWith(WHATSAPP_USER_PN_SUFFIX);
};

export const isGroupWhatsappId = (id: string) => {
	return id.endsWith(WHATSAPP_GROUP_ID_SUFFIX);
};

// Format plain phone number to create a whatsappPn
// e.g. "+61xxxxxxxxx" => "61xxxxxxxxx@s.whatsapp.net"
export const formatWhatsappId = (phoneNumber: string) => {
	// Remove leading '+' if it exists
	const normalized = phoneNumber.startsWith('+')
		? phoneNumber.slice(1)
		: phoneNumber;

	// Append the suffix
	return `${normalized}${WHATSAPP_USER_PN_SUFFIX}`;
};

// Extract phone number from whatsappPn
// e.g. "61xxxxxxxxx@s.whatsapp.net" => "+61xxxxxxxxx"
export const extractPhoneNumberFromWhatsappPn = (whatsappPn: string) => {
	const number = whatsappPn.slice(0, -WHATSAPP_USER_PN_SUFFIX.length);
	return `+${number}`;
};
