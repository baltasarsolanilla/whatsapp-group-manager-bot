import { whitelistService } from '@logic/services';
import { createMemberListController } from './baseMemberListController';

// whitelist entry point (Admin events)
export const whitelistController = createMemberListController(whitelistService, 'whitelist');
