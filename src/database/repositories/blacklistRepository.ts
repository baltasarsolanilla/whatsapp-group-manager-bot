import { Blacklist } from '@prisma/client';
import { createMemberListRepository } from './baseMemberListRepository';

export const blacklistRepository =
	createMemberListRepository<Blacklist>('blacklist');
