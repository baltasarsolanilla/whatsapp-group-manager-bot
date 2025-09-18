import prisma from '@database/prisma';
import { Group, User } from '@prisma/client';
import { MessageType } from 'types/evolution.d';

export type AddMessageType = {
	user: User;
	group: Group;
	whatsappId: string;
	messageType: MessageType;
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
		await prisma.message.create({
			data: {
				userId: user.id,
				groupId: group.id,
				whatsappId,
				messageType,
				date: new Date(messageTimestamp * 1000),
			},
		});
	},
};
