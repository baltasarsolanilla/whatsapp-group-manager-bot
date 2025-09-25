import prisma from '@database/prisma';
import { Blacklist, Group, User, Whitelist } from '@prisma/client';

// Temporary types until Prisma client is properly generated
type MemberListEntity = Whitelist | Blacklist;

// Generic interface for member list operations
interface IMemberListRepository<T extends MemberListEntity> {
	upsert(
		userId: string,
		groupId: string
	): Promise<T | (T & { user: User; group: Group })>;
	list(groupId?: string): Promise<T[]>;
	remove(userId: string, groupId: string): Promise<T | null>;
}

// Generic base repository factory
export function createMemberListRepository<T extends MemberListEntity>(
	entityName: 'whitelist' | 'blacklist'
): IMemberListRepository<T> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const model = (prisma as any)[entityName];

	return {
		async upsert(userId: string, groupId: string) {
			await model.upsert({
				where: { userId_groupId: { userId, groupId } },
				update: {},
				create: { userId, groupId },
			});

			return model.findUnique({
				where: { userId_groupId: { userId, groupId } },
				include: { user: true, group: true },
			}) as Promise<T & { user: User; group: Group }>;
		},

		async list(groupId?: string): Promise<T[]> {
			return model.findMany({
				where: groupId ? { groupId } : undefined,
			}) as Promise<T[]>;
		},

		async remove(userId: string, groupId: string): Promise<T | null> {
			return (
				model
					.deleteMany({
						where: { userId, groupId },
					})
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					.then((result: any) =>
						result.count > 0 ? ({ userId, groupId } as T) : null
					)
			);
		},
	};
}
