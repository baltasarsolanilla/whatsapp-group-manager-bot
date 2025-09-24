import { webhookEventService } from '@logic/services/webhookEventService';
import { webhookEventRepository } from '@database/repositories';
import { webhookEventMapper } from '@logic/mappers';
import { mockWebhookEvent } from '../../fixtures/mockData';

// Mock dependencies
jest.mock('@database/repositories');
jest.mock('@logic/mappers');

const mockedRepository = webhookEventRepository as jest.Mocked<
	typeof webhookEventRepository
>;
const mockedMapper = webhookEventMapper as jest.Mocked<
	typeof webhookEventMapper
>;

describe('Webhook Event Service', () => {
	beforeEach(() => {
		jest.clearAllMocks();

		// Setup mapper mocks
		mockedMapper.event = jest.fn().mockReturnValue(mockWebhookEvent.event);
		mockedMapper.instance = jest
			.fn()
			.mockReturnValue(mockWebhookEvent.instance);
		mockedMapper.data = jest.fn().mockReturnValue(mockWebhookEvent.data);
		mockedMapper.date = jest.fn().mockReturnValue(mockWebhookEvent.date_time);

		// Setup repository mock
		mockedRepository.add = jest.fn().mockResolvedValue(undefined);
	});

	describe('storeEvent', () => {
		it('should store webhook event using mapper and repository', async () => {
			await webhookEventService.storeEvent(mockWebhookEvent);

			// Verify mapper calls
			expect(mockedMapper.event).toHaveBeenCalledWith(mockWebhookEvent);
			expect(mockedMapper.instance).toHaveBeenCalledWith(mockWebhookEvent);
			expect(mockedMapper.data).toHaveBeenCalledWith(mockWebhookEvent);
			expect(mockedMapper.date).toHaveBeenCalledWith(mockWebhookEvent);

			// Verify repository call
			expect(mockedRepository.add).toHaveBeenCalledWith({
				event: mockWebhookEvent.event,
				instance: mockWebhookEvent.instance,
				data: mockWebhookEvent.data,
				createdAt: mockWebhookEvent.date_time,
			});
		});

		it('should handle repository errors', async () => {
			const repositoryError = new Error('Database insert failed');
			mockedRepository.add.mockRejectedValue(repositoryError);

			await expect(
				webhookEventService.storeEvent(mockWebhookEvent)
			).rejects.toThrow(repositoryError);

			expect(mockedRepository.add).toHaveBeenCalledTimes(1);
		});

		it('should handle mapper errors', async () => {
			const mapperError = new Error('Mapping failed');
			mockedMapper.event.mockImplementation(() => {
				throw mapperError;
			});

			await expect(
				webhookEventService.storeEvent(mockWebhookEvent)
			).rejects.toThrow(mapperError);

			expect(mockedMapper.event).toHaveBeenCalledWith(mockWebhookEvent);
			expect(mockedRepository.add).not.toHaveBeenCalled();
		});
	});
});
