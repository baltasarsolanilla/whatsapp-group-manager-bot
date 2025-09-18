import prisma from '@database/prisma';
import { Prisma } from '@prisma/client';

export const webhookEventRepository = {
	async add({
		event,
		instance,
		data,
		createdAt,
	}: Prisma.WebhookEventCreateInput) {
		await prisma.webhookEvent.create({
			data: {
				event,
				instance,
				data,
				createdAt,
			},
		});
	},
};
