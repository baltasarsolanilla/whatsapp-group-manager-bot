import { handlers } from '@logic/handlers';
import { blacklistService } from '@logic/services/blacklistService';
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
			console.log('MESSAGE_UPSERT: ', update);
			handler(update as WebhookEvent<T>);
		} else {
			console.warn('ALERT: Unknown event received', update);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
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
