import { handleMessageUpsert } from '@logic/botLogic';
import { EVOLUTION_EVENTS } from 'constants/evolution';
import { Request, Response } from 'express';
import { type WebhookPayload } from '../types/evolution';

export const controller = (
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	req: Request<{}, {}, WebhookPayload>,
	res: Response
) => {
	const update = req.body;
	if (update.event === EVOLUTION_EVENTS.MESSAGES_UPSERT) {
		handleMessageUpsert(update);
	}

	console.log('ALERT: Unknown event received');

	res.sendStatus(200);
};
