import {
  WHATSAPP_GROUP_SUFFIX,
  WHATSAPP_PERSONAL_SUFFIX,
} from "../../constants/messages";

export function isGroupMessage(message) {
  return message.key.remoteJid.endsWith(WHATSAPP_GROUP_SUFFIX);
}

export function isPersonalMessage(message) {
  return message.key.remoteJid.endsWith(WHATSAPP_PERSONAL_SUFFIX);
}
