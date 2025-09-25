import prisma from '@database/prisma';

// Temporary types until Prisma client is properly generated
type MemberListEntity = {
	id: string;
	userId: string;
	groupId: string;
	createdAt: Date;
};

type User = {
	id: string;
	whatsappId: string;
	whatsappPn?: string | null;
	name?: string | null;
	createdAt: Date;
};

type Group = {
	id: string;
	whatsappId: string;
	name?: string | null;
	inactivityThresholdMinutes: number;
	createdAt: Date;
};

// Generic interface for member list operations
interface IMemberListRepository<T extends MemberListEntity> {
	upsert(userId: string, groupId: string): Promise<T | (T & { user: User; group: Group })>;
	list(groupId?: string): Promise<T[]>;
	remove(userId: string, groupId: string): Promise<T | null>;
}

// Generic base repository factory
export function createMemberListRepository<T extends MemberListEntity>(
	entityName: 'whitelist' | 'blacklist',
	includeRelations: boolean = false
): IMemberListRepository<T> {
	const model = (prisma as any)[entityName];
	
	return {
		async upsert(userId: string, groupId: string) {
			if (includeRelations && entityName === 'whitelist') {
				// Special handling for whitelist with relations
				await model.upsert({
					where: { userId_groupId: { userId, groupId } },
					update: {},
					create: { userId, groupId },
				});

				return model.findUnique({
					where: { userId_groupId: { userId, groupId } },
					include: { user: true, group: true },
				}) as Promise<T & { user: User; group: Group }>;
			}

			// Standard upsert for blacklist and whitelist without relations
			return model.upsert({
				where: { userId_groupId: { userId, groupId } },
				update: {},
				create: { userId, groupId },
			}) as Promise<T>;
		},

		async list(groupId?: string): Promise<T[]> {
			return model.findMany({
				where: groupId ? { groupId } : undefined,
			}) as Promise<T[]>;
		},

		async remove(userId: string, groupId: string): Promise<T | null> {
			return model
				.deleteMany({
					where: { userId, groupId },
				})
				.then((result: any) =>
					result.count > 0 ? ({ userId, groupId } as T) : null
				);
		},
	};
}