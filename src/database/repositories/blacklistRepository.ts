import { createMemberListRepository } from './baseMemberListRepository';

// Temporary types until Prisma client is properly generated
type Blacklist = {
	id: string;
	userId: string;
	groupId: string;
	createdAt: Date;
};

export const blacklistRepository = createMemberListRepository<Blacklist>('blacklist');
