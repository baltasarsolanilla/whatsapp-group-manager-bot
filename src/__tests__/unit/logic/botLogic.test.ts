import { handleMessageUpsert } from '@logic/botLogic';
import { messageService } from '@logic/services';
import { isGroupMessage } from '@logic/helpers';
import {
	mockWebhookEvent,
	mockPrivateMessageUpsert,
	mockUser,
	mockGroup,
	mockMessage,
} from '../../fixtures/mockData';

// Mock dependencies
jest.mock('@logic/services', () => ({
	messageService: {
		ensureGroupMessageUpsert: jest.fn(),
	},
}));

jest.mock('@logic/helpers', () => ({
	isGroupMessage: jest.fn(),
}));

const mockedMessageService = messageService as jest.Mocked<
	typeof messageService
>;
const mockedIsGroupMessage = isGroupMessage as jest.MockedFunction<
	typeof isGroupMessage
>;

describe('Bot Logic', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('handleMessageUpsert', () => {
		it('should process group messages', async () => {
			const mockResult = {
				user: mockUser,
				group: mockGroup,
				membership: {
					id: 'membership-123',
					userId: 'user-123',
					groupId: 'group-123',
				},
				message: mockMessage,
			};

			mockedIsGroupMessage.mockReturnValue(true);
			mockedMessageService.ensureGroupMessageUpsert.mockResolvedValue(
				mockResult as any
			);

			await handleMessageUpsert(mockWebhookEvent);

			expect(mockedIsGroupMessage).toHaveBeenCalledWith(mockWebhookEvent.data);
			expect(
				mockedMessageService.ensureGroupMessageUpsert
			).toHaveBeenCalledWith(mockWebhookEvent.data);
		});

		it('should skip private messages', async () => {
			const privateMessageEvent = {
				...mockWebhookEvent,
				data: mockPrivateMessageUpsert,
			};

			mockedIsGroupMessage.mockReturnValue(false);

			await handleMessageUpsert(privateMessageEvent);

			expect(mockedIsGroupMessage).toHaveBeenCalledWith(
				privateMessageEvent.data
			);
			expect(
				mockedMessageService.ensureGroupMessageUpsert
			).not.toHaveBeenCalled();
		});

		it('should handle errors from message service', async () => {
			const error = new Error('Database error');
			mockedIsGroupMessage.mockReturnValue(true);
			mockedMessageService.ensureGroupMessageUpsert.mockRejectedValue(error);

			await expect(handleMessageUpsert(mockWebhookEvent)).rejects.toThrow(
				error
			);

			expect(mockedIsGroupMessage).toHaveBeenCalledWith(mockWebhookEvent.data);
			expect(
				mockedMessageService.ensureGroupMessageUpsert
			).toHaveBeenCalledWith(mockWebhookEvent.data);
		});
	});
});
