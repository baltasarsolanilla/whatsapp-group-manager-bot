/* eslint-disable no-console */
import { handlers } from '@logic/handlers';
import { webhookEventService } from '@logic/services';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
import { AppError } from '@utils/AppError';
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

		// Basic validation of webhook payload
		if (!update || typeof update !== 'object') {
			console.warn('❌ Invalid webhook payload received:', update);
			throw new AppError('Invalid webhook payload', 400);
		}

		if (!update.event) {
			console.warn('❌ Missing event field in webhook payload:', update);
			throw new AppError('Missing event field', 422);
		}

		// Store webhook event for audit/debugging
		try {
			webhookEventService.storeEvent(update);
		} catch (storeError) {
			console.error('⚠️  Failed to store webhook event:', storeError);
			// Don't fail the webhook processing if storage fails
		}

		const handler = handlers[update.event];

		if (handler) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await (handler as any)(update);
				console.log(`✅ Successfully processed webhook event: ${update.event}`);
			} catch (handlerError) {
				console.error(
					`❌ Error processing webhook event ${update.event}:`,
					handlerError
				);
				// Don't return error to webhook sender, log for debugging
			}
		} else {
			console.warn('⚠️  Unknown event received:', update.event);
		}

		resSuccess(res, { received: true });
	}
);
