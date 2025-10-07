import prisma from '@database/prisma';
import type { User } from '@prisma/client';
import { isUserWhatsappPn } from '@logic/helpers';

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
		// Validate whatsappPn format if provided
		const validWhatsappPn =
			whatsappPn && isUserWhatsappPn(whatsappPn) ? whatsappPn : undefined;

		return prisma.user.upsert({
			where: {
				whatsappId,
			},
			update: {
				...(name ? { name } : {}),
				...(validWhatsappPn ? { whatsappPn: validWhatsappPn } : {}),
			},
			create: {
				whatsappId,
				...(name !== undefined ? { name } : {}),
				...(validWhatsappPn !== undefined
					? { whatsappPn: validWhatsappPn }
					: {}),
			},
		});
	},

	async getByWaId(id: string): Promise<User | null> {
		return prisma.user.findUnique({ where: { whatsappId: id } });
	},

	async getByPn(whatsappPn: string): Promise<User | null> {
		return prisma.user.findUnique({ where: { whatsappPn } });
	},

	/** Create a new user with only whatsappId */
	async createByWaId(whatsappId: string, name?: string): Promise<User> {
		return prisma.user.create({
			data: {
				whatsappId,
				...(name !== undefined ? { name } : {}),
			},
		});
	},

	/** Create a new user with only phoneNumber (whatsappPn) */
	async createByPn(whatsappPn: string, name?: string): Promise<User> {
		return prisma.user.create({
			data: {
				whatsappPn,
				...(name !== undefined ? { name } : {}),
			},
		});
	},
};
