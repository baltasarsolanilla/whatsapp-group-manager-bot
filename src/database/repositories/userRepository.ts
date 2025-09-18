import prisma from '@database/prisma';
import type { User } from '@prisma/client';

/** Create a new user if it doesn't exist, update name & phone number if required */
type UpsertUserType = {
	whatsappId: string;
	whatsappPn?: string;
	name?: string;
};

export const userRepository = {
	async upsert({
		whatsappId,
		whatsappPn,
		name,
	}: UpsertUserType): Promise<User> {
		return prisma.user.upsert({
			where: {
				whatsappId,
				...(whatsappPn !== undefined ? { whatsappPn } : {}),
			},
			update: {
				...(name !== undefined ? { name } : {}),
				...(whatsappPn !== undefined ? { whatsappPn } : {}),
			},
			create: {
				whatsappId,
				...(name !== undefined ? { name } : {}),
				...(whatsappPn !== undefined ? { whatsappPn } : {}),
			},
		});
	},

	async getByWaId(id: string): Promise<User | null> {
		return prisma.user.findUnique({ where: { whatsappId: id } });
	},

	async getByPn(whatsappPn: string): Promise<User | null> {
		return prisma.user.findUnique({ where: { whatsappPn } });
	},
};
