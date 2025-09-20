import prisma from '@database/prisma';
import { Group, User } from '@prisma/client';
import { MessageType } from 'types/evolution';

export type AddMessageType = {
	user: User;
	group: Group;
	whatsappId: string;
	messageType: MessageType | string;
	messageTimestamp: number;
};

export const messageRepository = {
	async add({
		user,
		group,
		whatsappId,
		messageType,
		messageTimestamp,
	}: AddMessageType) {
		return prisma.message.upsert({
			where: { whatsappId },
			update: {}, // no-op on duplicate
			create: {
				userId: user.id,
				groupId: group.id,
				whatsappId,
				messageType,
				date: new Date(messageTimestamp * 1000),
			},
		});
	},
};
