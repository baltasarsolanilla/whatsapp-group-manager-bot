import { Whitelist } from '@prisma/client';
import { createMemberListRepository } from './baseMemberListRepository';

export const whitelistRepository = createMemberListRepository<Whitelist>(
	'whitelist',
	true
);
