import { webhookEventRepository } from '@database/repositories';
import { webhookEventMapper } from '@logic/mappers';
import { WebhookEvent } from 'types/evolution';

export async function storeWebhookEvent(webhookEvent: WebhookEvent) {
	await webhookEventRepository.add({
		event: webhookEventMapper.event(webhookEvent),
		instance: webhookEventMapper.instance(webhookEvent),
		data: webhookEventMapper.data(webhookEvent),
		createdAt: webhookEventMapper.date(webhookEvent),
	});
}
