/* eslint-disable no-console */
import { handlers } from '@logic/handlers';
import { webhookEventService } from '@logic/services';
import { Request, Response } from 'express';
import type { WebhookEvent } from 'types/evolution';

// webhook entrypoint (Evolution API events)
export const webhookController = <T extends keyof typeof handlers>(
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	req: Request<{}, {}, WebhookEvent>,
	res: Response
) => {
	try {
		const update = req.body;
		webhookEventService.storeEvent(update);

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
