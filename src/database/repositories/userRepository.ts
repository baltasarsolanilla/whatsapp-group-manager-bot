import prisma from '@database/prisma';

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
}: UpsertUserType) {
	return prisma.user.upsert({
		where: { whatsappId },
		update: { name, whatsappPn },
		create: { whatsappId, name, whatsappPn },
	});
}
