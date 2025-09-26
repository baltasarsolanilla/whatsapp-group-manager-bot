import { blacklistRepository } from '@database/repositories';
import { createMemberListService } from './baseMemberListService';

export const blacklistService = createMemberListService(
	blacklistRepository,
	'blacklist'
);
