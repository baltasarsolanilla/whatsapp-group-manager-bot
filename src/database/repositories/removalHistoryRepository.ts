import prisma from '@database/prisma';
import type { RemovalOutcome } from '@prisma/client';

export const removalHistoryRepository = {
	async add({
		userId,
		groupId,
		outcome,
		reason,
	}: {
		userId: string;
		groupId: string;
		outcome: RemovalOutcome;
		reason: string;
	}) {
		return prisma.removalHistory.create({
			data: {
				userId,
				groupId,
				outcome,
				reason,
			},
		});
	},
};
