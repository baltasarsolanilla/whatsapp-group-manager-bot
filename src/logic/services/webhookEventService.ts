import { addWebhookEvent } from '@database/repositories/webhookEventRepository';
import { webhookEventMapper } from '@logic/mappers';
import { WebhookPayload } from 'types/evolution';

export async function storeWebhookEvent(webhookEvent: WebhookPayload) {
	await addWebhookEvent({
		event: webhookEventMapper.event(webhookEvent),
		instance: webhookEventMapper.instance(webhookEvent),
		data: webhookEventMapper.data(webhookEvent),
		createdAt: webhookEventMapper.date(webhookEvent),
	});
}
