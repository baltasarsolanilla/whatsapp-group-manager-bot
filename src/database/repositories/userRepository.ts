import prisma from '@database/prisma';
import type { User } from '@prisma/client';

/** Create a new user if it doesn't exist, update name & phone number if required */
type UpsertUserType = {
	whatsappId: string;
	whatsappPn?: string;
	name: string;
};

export async function upsertUser({
	whatsappId,
	whatsappPn,
	name,
}: UpsertUserType): Promise<User> {
	return prisma.user.upsert({
		where: { whatsappId },
		update: { name, whatsappPn },
		create: { whatsappId, name, whatsappPn },
	});
}

export async function getUserByWaId(id: string): Promise<User | null> {
	return prisma.user.findUnique({ where: { whatsappId: id } });
}

export async function getUserByPn(pn: string): Promise<User | null> {
	return prisma.user.findUnique({ where: { whatsappPn: pn } });
}
