import { handlers } from '@logic/handlers';
import { storeWebhookEvent } from '@logic/services/webhookEventService';
import { whitelistService } from '@logic/services/whitelistService';
import { Request, Response } from 'express';
import type { WebhookEvent } from '../types/evolution';

export const controller = <T extends keyof typeof handlers>(
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	req: Request<{}, {}, WebhookEvent>,
	res: Response
) => {
	const update = req.body;
	storeWebhookEvent(update);

	const handler = handlers[update.event as T];

	if (handler) {
		console.log('MESSAGE_UPSERT: ', update);
		handler(update as WebhookEvent<T>);
	} else {
		console.warn('ALERT: Unknown event received', update);
	}

	res.sendStatus(200);
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
	console.log('Add member to blacklist');
	res.sendStatus(200);
	// const { phoneNumber } = req.body;
	// await blacklistService.add(phoneNumber);
	// res.status(201).json({ message: "Added to blacklist" });
};
