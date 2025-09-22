import { PATHS } from '@constants/routesConstants';
import express from 'express';
import {
	blacklistController,
	groupController,
	removalQueueController,
	webhookController,
	whitelistController,
} from '.';

const router = express.Router();

// ======================== WEBHOOK ========================
router.post(PATHS.DEFAULT, webhookController);
router.post(PATHS.WEBHOOK, webhookController);

// ======================== ADMIN WHITELIST ========================
router.post(`/${PATHS.ADMIN.LISTS.WHITELIST}`, whitelistController.add);
router.get(`/${PATHS.ADMIN.LISTS.WHITELIST}`, whitelistController.list);
router.delete(`/${PATHS.ADMIN.LISTS.WHITELIST}`, whitelistController.remove);

// ======================== ADMIN BLACKLIST ========================
router.post(`/${PATHS.ADMIN.LISTS.BLACKLIST}`, blacklistController.add);
router.get(`/${PATHS.ADMIN.LISTS.BLACKLIST}`, blacklistController.list);
router.delete(`/${PATHS.ADMIN.LISTS.BLACKLIST}`, blacklistController.remove);

// ======================== ADMIN REMOVE QUEUE ========================
router.get(`/${PATHS.ADMIN.REMOVAL_QUEUE.BASE}`, removalQueueController.list);
router.post(
	`/${PATHS.ADMIN.REMOVAL_QUEUE.RUN}`,
	removalQueueController.runQueue
);
router.post(
	`/${PATHS.ADMIN.REMOVAL_QUEUE.SYNC}`,
	removalQueueController.syncQueue
);
router.post(
	`/${PATHS.ADMIN.REMOVAL_QUEUE.RUN_WORKFLOW}`,
	removalQueueController.runWorkflow
);

// ======================== ADMIN GROUPS ========================
router.post(`/${PATHS.ADMIN.GROUPS.INGEST}`, groupController.ingest);
router.patch(`/${PATHS.ADMIN.GROUPS.UPDATE}`, groupController.update);

export default router;
