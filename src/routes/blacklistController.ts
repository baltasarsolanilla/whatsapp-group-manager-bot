import { blacklistService } from '@logic/services';
import { createMemberListController } from './baseMemberListController';

// blacklist entry point (Admin events)
export const blacklistController = createMemberListController(blacklistService, 'blacklist');
