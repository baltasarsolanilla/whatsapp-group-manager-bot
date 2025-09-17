import { addToWhitelist, controller } from '@routes/controller';
import express from 'express';
import { listWhitelist, removeFromWhitelist } from './controller';

const router = express.Router();

router.post('/', controller);
router.post('/whitelist', addToWhitelist);
router.get('/whitelist', listWhitelist);
router.delete('/whitelist', removeFromWhitelist);

// router.post('/blacklist', addToBlacklist);
// router.get('/blacklist', addToBlacklist);
// router.delete('/blacklist', addToBlacklist);

export default router;
