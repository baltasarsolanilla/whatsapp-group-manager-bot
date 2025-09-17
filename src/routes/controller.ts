/* eslint-disable no-console */
import { handlers } from '@logic/handlers';
import { blacklistService } from '@logic/services/blacklistService';
import {
	listInactiveMembers,
	removeInactiveMembers,
} from '@logic/services/removalQueueService';
import { storeWebhookEvent } from '@logic/services/webhookEventService';
import { whitelistService } from '@logic/services/whitelistService';
import { Request, Response } from 'express';
import type { WebhookEvent } from '../types/evolution';

export const controller = <T extends keyof typeof handlers>(
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	req: Request<{}, {}, WebhookEvent>,
	res: Response
) => {
	try {
		const update = req.body;
		storeWebhookEvent(update);

		const handler = handlers[update.event as T];

		if (handler) {
			handler(update as WebhookEvent<T>);
		} else {
			console.warn('ALERT: Unknown event received', update);
		}
		res.sendStatus(200);
	} catch (err) {
		console.error(err);
		res.sendStatus(500).json({ error: 'Internal server error' });
	}
};

export const addToWhitelist = async (req: Request, res: Response) => {
	try {
		const { phoneNumber, groupId } = req.body;
		await whitelistService.add(phoneNumber, groupId);
		res.status(201).json({ message: 'Added to whitelist' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
};
export const removeFromWhitelist = async (req: Request, res: Response) => {
	try {
		const { phoneNumber, groupId } = req.body;
		await whitelistService.remove(phoneNumber, groupId);
		res.status(201).json({ message: 'Removed from whitelist' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
};
export const listWhitelist = async (req: Request, res: Response) => {
	try {
		const groupId = req.query.groupId as string | undefined;
		const members = await whitelistService.list(groupId);
		res.json(members);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const addToBlacklist = async (req: Request, res: Response) => {
	try {
		const { phoneNumber, groupId } = req.body;
		await blacklistService.add(phoneNumber, groupId);
		res.status(201).json({ message: 'Added to blacklist' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
};
export const removeFromBlacklist = async (req: Request, res: Response) => {
	try {
		const { phoneNumber, groupId } = req.body;
		await blacklistService.remove(phoneNumber, groupId);
		res.status(201).json({ message: 'Removed from blacklist' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
};
export const listBlacklist = async (req: Request, res: Response) => {
	try {
		const groupId = req.query.groupId as string | undefined;
		const members = await blacklistService.list(groupId);
		res.json(members);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
};
export const runRemovalQueue = async (req: Request, res: Response) => {
	try {
		const { groupId } = req.body;
		const membersRemoved = await removeInactiveMembers(groupId);
		return res.json(membersRemoved);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
};
export const listRemovalQueue = async (req: Request, res: Response) => {
	try {
		const groupId = req.query.groupId as string;
		const members = await listInactiveMembers(groupId);
		return res.json(members);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
};
