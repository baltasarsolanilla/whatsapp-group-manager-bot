import { PATHS } from '@constants/routesConstants';
import {
	addToBlacklist,
	addToWhitelist,
	controller,
	listBlacklist,
	listRemovalQueue,
	removeFromBlacklist,
	runRemovalQueue,
} from '@routes/controller';
import express from 'express';
import { listWhitelist, removeFromWhitelist } from './controller';

const router = express.Router();

// ============================================================================
// WEBHOOK
// ============================================================================

router.post(PATHS.DEFAULT, controller);

// ============================================================================
// WHITELIST
// ============================================================================

router.post(PATHS.WHITELIST, addToWhitelist);
router.get(PATHS.WHITELIST, listWhitelist);
router.delete(PATHS.WHITELIST, removeFromWhitelist);

// ============================================================================
// BLACKLIST
// ============================================================================

router.post(PATHS.BLACKLIST, addToBlacklist);
router.get(PATHS.BLACKLIST, listBlacklist);
router.delete(PATHS.BLACKLIST, removeFromBlacklist);

// ============================================================================
// REMOVE QUEUE
// ============================================================================

router.get(PATHS.REMOVE_QUEUE, listRemovalQueue);
router.post(PATHS.REMOVE_QUEUE, runRemovalQueue);

export default router;
