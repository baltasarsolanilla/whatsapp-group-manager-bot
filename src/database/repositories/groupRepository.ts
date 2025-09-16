import prisma from '@database/prisma';
import type { Group } from '@prisma/client';

/** Create a new group if it doesn't exist, update name if required */
type UpsertGroupType = {
	whatsappId: string;
	name: string;
};

export async function upsertGroup({
	whatsappId,
	name,
}: UpsertGroupType): Promise<Group> {
	return prisma.group.upsert({
		where: { whatsappId },
		update: { name },
		create: { whatsappId, name },
	});
}

export async function getGroupByWaId(id: string): Promise<Group | null> {
	return prisma.group.findUnique({ where: { whatsappId: id } });
}
