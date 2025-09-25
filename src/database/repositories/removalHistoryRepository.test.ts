import { removalHistoryRepository } from '@database/repositories/removalHistoryRepository';
import mockPrisma from '@database/__mocks__/prisma';

// Mock the prisma module
jest.mock('@database/prisma', () => mockPrisma);

// Define RemovalOutcome enum to match the implementation
const RemovalOutcome = {
	SUCCESS: 'SUCCESS',
	FAILURE: 'FAILURE'
} as const;

describe('removalHistoryRepository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('add', () => {
		it('should add removal history entry with SUCCESS outcome', async () => {
			const historyData = {
				userId: 'user123',
				groupId: 'group456',
				outcome: RemovalOutcome.SUCCESS,
				reason: 'User was inactive for more than 30 days'
			};
			const mockHistoryEntry = {
				id: 'history1',
				userId: historyData.userId,
				groupId: historyData.groupId,
				outcome: historyData.outcome,
				reason: historyData.reason,
				processedAt: new Date()
			};

			mockPrisma.removalHistory.create.mockResolvedValue(mockHistoryEntry);

			const result = await removalHistoryRepository.add(historyData);

			expect(mockPrisma.removalHistory.create).toHaveBeenCalledWith({
				data: {
					userId: historyData.userId,
					groupId: historyData.groupId,
					outcome: historyData.outcome,
					reason: historyData.reason,
				},
			});
			expect(result).toEqual(mockHistoryEntry);
		});

		it('should add removal history entry with FAILURE outcome', async () => {
			const historyData = {
				userId: 'user123',
				groupId: 'group456',
				outcome: RemovalOutcome.FAILURE,
				reason: 'Failed to remove user - insufficient permissions'
			};
			const mockHistoryEntry = {
				id: 'history2',
				userId: historyData.userId,
				groupId: historyData.groupId,
				outcome: historyData.outcome,
				reason: historyData.reason,
				processedAt: new Date()
			};

			mockPrisma.removalHistory.create.mockResolvedValue(mockHistoryEntry);

			const result = await removalHistoryRepository.add(historyData);

			expect(mockPrisma.removalHistory.create).toHaveBeenCalledWith({
				data: {
					userId: historyData.userId,
					groupId: historyData.groupId,
					outcome: historyData.outcome,
					reason: historyData.reason,
				},
			});
			expect(result).toEqual(mockHistoryEntry);
		});

		it('should handle empty string values', async () => {
			const historyData = {
				userId: '',
				groupId: '',
				outcome: RemovalOutcome.SUCCESS,
				reason: ''
			};
			const mockHistoryEntry = {
				id: 'history3',
				userId: '',
				groupId: '',
				outcome: RemovalOutcome.SUCCESS,
				reason: '',
				processedAt: new Date()
			};

			mockPrisma.removalHistory.create.mockResolvedValue(mockHistoryEntry);

			const result = await removalHistoryRepository.add(historyData);

			expect(mockPrisma.removalHistory.create).toHaveBeenCalledWith({
				data: {
					userId: '',
					groupId: '',
					outcome: RemovalOutcome.SUCCESS,
					reason: '',
				},
			});
			expect(result).toEqual(mockHistoryEntry);
		});

		it('should handle long reason strings', async () => {
			const longReason = 'A'.repeat(1000); // Very long reason string
			const historyData = {
				userId: 'user123',
				groupId: 'group456',
				outcome: RemovalOutcome.FAILURE,
				reason: longReason
			};
			const mockHistoryEntry = {
				id: 'history4',
				userId: historyData.userId,
				groupId: historyData.groupId,
				outcome: historyData.outcome,
				reason: longReason,
				processedAt: new Date()
			};

			mockPrisma.removalHistory.create.mockResolvedValue(mockHistoryEntry);

			const result = await removalHistoryRepository.add(historyData);

			expect(mockPrisma.removalHistory.create).toHaveBeenCalledWith({
				data: {
					userId: historyData.userId,
					groupId: historyData.groupId,
					outcome: historyData.outcome,
					reason: longReason,
				},
			});
			expect(result).toEqual(mockHistoryEntry);
		});

		it('should handle different types of removal reasons', async () => {
			const reasons = [
				'Inactivity timeout exceeded',
				'Manual removal by admin',
				'Spam detection triggered',
				'User requested removal',
				'Bot malfunction - retry needed',
				'WhatsApp API error',
				'Group permissions insufficient',
				null, // Some reasons might be null
			];

			for (const reason of reasons) {
				const historyData = {
					userId: `user-${Math.random()}`,
					groupId: `group-${Math.random()}`,
					outcome: Math.random() > 0.5 ? RemovalOutcome.SUCCESS : RemovalOutcome.FAILURE,
					reason
				};
				const mockHistoryEntry = {
					id: `history-${Math.random()}`,
					userId: historyData.userId,
					groupId: historyData.groupId,
					outcome: historyData.outcome,
					reason,
					processedAt: new Date()
				};

				mockPrisma.removalHistory.create.mockResolvedValue(mockHistoryEntry);

				const result = await removalHistoryRepository.add(historyData);

				expect(mockPrisma.removalHistory.create).toHaveBeenCalledWith({
					data: {
						userId: historyData.userId,
						groupId: historyData.groupId,
						outcome: historyData.outcome,
						reason,
					},
				});
				expect(result).toEqual(mockHistoryEntry);
				
				jest.clearAllMocks();
			}
		});

		it('should handle database errors', async () => {
			const historyData = {
				userId: 'user123',
				groupId: 'group456',
				outcome: RemovalOutcome.SUCCESS,
				reason: 'User was inactive'
			};
			const error = new Error('Database connection failed');

			mockPrisma.removalHistory.create.mockRejectedValue(error);

			await expect(removalHistoryRepository.add(historyData))
				.rejects.toThrow('Database connection failed');

			expect(mockPrisma.removalHistory.create).toHaveBeenCalledWith({
				data: {
					userId: historyData.userId,
					groupId: historyData.groupId,
					outcome: historyData.outcome,
					reason: historyData.reason,
				},
			});
		});

		it('should handle foreign key constraint errors', async () => {
			const historyData = {
				userId: 'nonexistent-user',
				groupId: 'nonexistent-group',
				outcome: RemovalOutcome.SUCCESS,
				reason: 'Test reason'
			};
			const error = new Error('Foreign key constraint failed');

			mockPrisma.removalHistory.create.mockRejectedValue(error);

			await expect(removalHistoryRepository.add(historyData))
				.rejects.toThrow('Foreign key constraint failed');

			expect(mockPrisma.removalHistory.create).toHaveBeenCalledWith({
				data: {
					userId: historyData.userId,
					groupId: historyData.groupId,
					outcome: historyData.outcome,
					reason: historyData.reason,
				},
			});
		});

		it('should handle validation errors', async () => {
			const historyData = {
				userId: 'user123',
				groupId: 'group456',
				outcome: 'INVALID_OUTCOME' as any, // Invalid enum value
				reason: 'Test reason'
			};
			const error = new Error('Validation error: Invalid enum value');

			mockPrisma.removalHistory.create.mockRejectedValue(error);

			await expect(removalHistoryRepository.add(historyData))
				.rejects.toThrow('Validation error: Invalid enum value');

			expect(mockPrisma.removalHistory.create).toHaveBeenCalledWith({
				data: {
					userId: historyData.userId,
					groupId: historyData.groupId,
					outcome: 'INVALID_OUTCOME',
					reason: historyData.reason,
				},
			});
		});

		it('should handle multiple concurrent additions', async () => {
			const historyEntries = [
				{
					userId: 'user1',
					groupId: 'group1',
					outcome: RemovalOutcome.SUCCESS,
					reason: 'Reason 1'
				},
				{
					userId: 'user2',
					groupId: 'group2',
					outcome: RemovalOutcome.FAILURE,
					reason: 'Reason 2'
				},
				{
					userId: 'user3',
					groupId: 'group3',
					outcome: RemovalOutcome.SUCCESS,
					reason: 'Reason 3'
				}
			];

			const mockResults = historyEntries.map((entry, index) => ({
				id: `history${index + 1}`,
				...entry,
				processedAt: new Date()
			}));

			mockPrisma.removalHistory.create
				.mockResolvedValueOnce(mockResults[0])
				.mockResolvedValueOnce(mockResults[1])
				.mockResolvedValueOnce(mockResults[2]);

			const promises = historyEntries.map(entry => removalHistoryRepository.add(entry));
			const results = await Promise.all(promises);

			expect(results).toHaveLength(3);
			expect(results).toEqual(mockResults);
			expect(mockPrisma.removalHistory.create).toHaveBeenCalledTimes(3);
		});
	});
});