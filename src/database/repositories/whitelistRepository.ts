import { createMemberListRepository } from './baseMemberListRepository';

// Temporary types until Prisma client is properly generated
type Whitelist = {
	id: string;
	userId: string;
	groupId: string;
	createdAt: Date;
};

export const whitelistRepository = createMemberListRepository<Whitelist>('whitelist', true);
