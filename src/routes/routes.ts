import {
	addToBlacklist,
	addToWhitelist,
	controller,
	listBlacklist,
	removeFromBlacklist,
} from '@routes/controller';
import express from 'express';
import { listWhitelist, removeFromWhitelist } from './controller';

const router = express.Router();

// ============================================================================
// WEBHOOK
// ============================================================================

router.post('/', controller);

// ============================================================================
// WHITELIST
// ============================================================================

router.post('/whitelist', addToWhitelist);
router.get('/whitelist', listWhitelist);
router.delete('/whitelist', removeFromWhitelist);

// ============================================================================
// BLACKLIST
// ============================================================================

router.post('/blacklist', addToBlacklist);
router.get('/blacklist', listBlacklist);
router.delete('/blacklist', removeFromBlacklist);

export default router;
