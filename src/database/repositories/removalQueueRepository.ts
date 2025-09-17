import prisma from '@database/prisma';
import { type Group, type User, RemovalStatus } from '@prisma/client';

// Add to removal queue
export const addUserToRemovalQueue = async ({
	user,
	group,
}: {
	user: User;
	group: Group;
}) => {
	await prisma.removalQueue.create({
		data: {
			userId: user.id,
			groupId: group.id,
			status: RemovalStatus.PENDING,
		},
	});
};
