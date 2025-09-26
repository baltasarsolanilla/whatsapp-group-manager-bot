/* eslint-disable no-console */
import { handlers } from '@logic/handlers';
import { webhookEventService } from '@logic/services';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
import { Request, Response } from 'express';
import type { WebhookEvent } from 'types/evolution';

// webhook entrypoint (Evolution API events)
export const webhookController = catchAsync(
	async (
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		req: Request<{}, {}, WebhookEvent>,
		res: Response
	) => {
		const update = req.body;
		webhookEventService.storeEvent(update);

		const handler = handlers[update.event];

		if (handler) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(handler as any)(update);
		} else {
			console.warn('Unknown event received', update);
		}
		resSuccess(res);
	}
);
