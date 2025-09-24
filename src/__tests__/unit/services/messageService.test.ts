import { createMessageService } from '@services/messageService';
import axios from 'axios';
import { handleAxiosError } from '@utils/errorHandler';

// Mock dependencies
jest.mock('axios');
jest.mock('@utils/errorHandler');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedHandleAxiosError = handleAxiosError as jest.MockedFunction<
	typeof handleAxiosError
>;

describe('Message Service', () => {
	const mockConfig = {
		BASE_URL: 'http://localhost:8080',
		API_KEY: 'test-api-key',
		INSTANCE: 'test-instance',
	};

	let messageService: ReturnType<typeof createMessageService>;

	beforeEach(() => {
		jest.clearAllMocks();
		messageService = createMessageService(mockConfig);
		mockedAxios.post = jest.fn();
	});

	describe('sendMessage', () => {
		const testPhoneNumber = '61123456789@s.whatsapp.net';
		const testMessage = 'Hello, this is a test message';

		it('should send message successfully', async () => {
			mockedAxios.post.mockResolvedValue({ data: 'success' });

			await messageService.sendMessage(testPhoneNumber, testMessage);

			expect(mockedAxios.post).toHaveBeenCalledWith(
				`${mockConfig.BASE_URL}/message/sendText/${mockConfig.INSTANCE}`,
				{
					number: testPhoneNumber,
					text: testMessage,
				},
				{
					headers: {
						apikey: mockConfig.API_KEY,
					},
				}
			);
		});

		it('should handle axios errors', async () => {
			const error = new Error('Network error');
			mockedAxios.post.mockRejectedValue(error);
			mockedHandleAxiosError.mockImplementation(() => {
				throw error;
			});

			await expect(
				messageService.sendMessage(testPhoneNumber, testMessage)
			).rejects.toThrow(error);

			expect(mockedAxios.post).toHaveBeenCalledTimes(1);
			expect(mockedHandleAxiosError).toHaveBeenCalledWith(error);
		});

		it('should construct correct API endpoint', async () => {
			mockedAxios.post.mockResolvedValue({ data: 'success' });

			await messageService.sendMessage(testPhoneNumber, testMessage);

			const expectedUrl = `${mockConfig.BASE_URL}/message/sendText/${mockConfig.INSTANCE}`;
			expect(mockedAxios.post).toHaveBeenCalledWith(
				expectedUrl,
				expect.any(Object),
				expect.any(Object)
			);
		});

		it('should include correct headers', async () => {
			mockedAxios.post.mockResolvedValue({ data: 'success' });

			await messageService.sendMessage(testPhoneNumber, testMessage);

			expect(mockedAxios.post).toHaveBeenCalledWith(
				expect.any(String),
				expect.any(Object),
				{
					headers: {
						apikey: mockConfig.API_KEY,
					},
				}
			);
		});

		it('should construct correct payload', async () => {
			mockedAxios.post.mockResolvedValue({ data: 'success' });

			await messageService.sendMessage(testPhoneNumber, testMessage);

			expect(mockedAxios.post).toHaveBeenCalledWith(
				expect.any(String),
				{
					number: testPhoneNumber,
					text: testMessage,
				},
				expect.any(Object)
			);
		});
	});
});
