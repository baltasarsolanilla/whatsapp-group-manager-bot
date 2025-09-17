import { handlers } from '@logic/handlers';
import { storeWebhookEvent } from '@logic/services/webhookEventService';
import { Request, Response } from 'express';
import type { WebhookPayload } from '../types/evolution';

export const controller = <T extends keyof typeof handlers>(
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	req: Request<{}, {}, WebhookPayload>,
	res: Response
) => {
	const update = req.body;
	storeWebhookEvent(update);

	const handler = handlers[update.event as T];

	if (handler) {
		console.log('MESSAGE_UPSERT: ', update);
		handler(update as WebhookPayload<T>);
	} else {
		console.warn('ALERT: Unknown event received', update);
	}

	res.sendStatus(200);
};
