import { whitelistRepository } from '@database/repositories';
import { createMemberListService } from './baseMemberListService';

export const whitelistService = createMemberListService(whitelistRepository, 'whitelist');
