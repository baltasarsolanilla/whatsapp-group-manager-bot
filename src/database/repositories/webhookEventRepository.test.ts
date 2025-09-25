import { webhookEventRepository } from '@database/repositories/webhookEventRepository';
import mockPrisma from '@database/__mocks__/prisma';

// Mock the prisma module
jest.mock('@database/prisma', () => mockPrisma);

describe('webhookEventRepository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('add', () => {
		it('should add webhook event with all required data', async () => {
			const webhookData = {
				event: 'message.text',
				instance: 'test-instance',
				data: { 
					message: 'Hello world', 
					from: 'user@c.us',
					group: 'group@g.us',
					timestamp: 1640995200
				},
				createdAt: new Date()
			};

			mockPrisma.webhookEvent.create.mockResolvedValue(undefined);

			await webhookEventRepository.add(webhookData);

			expect(mockPrisma.webhookEvent.create).toHaveBeenCalledWith({
				data: {
					event: webhookData.event,
					instance: webhookData.instance,
					data: webhookData.data,
					createdAt: webhookData.createdAt,
				},
			});
		});

		it('should handle different event types', async () => {
			const eventTypes = [
				'message.text',
				'message.image',
				'message.video',
				'message.audio',
				'message.document',
				'group.participant.add',
				'group.participant.remove',
				'connection.update',
				'qr.updated',
				'instance.status'
			];

			for (const eventType of eventTypes) {
				const webhookData = {
					event: eventType,
					instance: 'test-instance',
					data: { 
						eventType,
						timestamp: Date.now(),
						metadata: { test: true }
					},
					createdAt: new Date()
				};

				mockPrisma.webhookEvent.create.mockResolvedValue(undefined);

				await webhookEventRepository.add(webhookData);

				expect(mockPrisma.webhookEvent.create).toHaveBeenCalledWith({
					data: {
						event: eventType,
						instance: webhookData.instance,
						data: webhookData.data,
						createdAt: webhookData.createdAt,
					},
				});
				
				jest.clearAllMocks();
			}
		});

		it('should handle different instance names', async () => {
			const instances = [
				'prod-instance',
				'dev-instance',
				'test-instance-123',
				'staging_bot',
				'main-bot-v2'
			];

			for (const instance of instances) {
				const webhookData = {
					event: 'message.text',
					instance,
					data: { 
						message: `Message from ${instance}`,
						timestamp: Date.now()
					},
					createdAt: new Date()
				};

				mockPrisma.webhookEvent.create.mockResolvedValue(undefined);

				await webhookEventRepository.add(webhookData);

				expect(mockPrisma.webhookEvent.create).toHaveBeenCalledWith({
					data: {
						event: webhookData.event,
						instance,
						data: webhookData.data,
						createdAt: webhookData.createdAt,
					},
				});
				
				jest.clearAllMocks();
			}
		});

		it('should handle complex nested JSON data', async () => {
			const complexData = {
				message: {
					id: 'msg123',
					type: 'text',
					content: 'Hello world',
					mentions: ['user1@c.us', 'user2@c.us'],
					quotedMessage: {
						id: 'quoted123',
						content: 'Original message',
						author: 'user3@c.us'
					}
				},
				sender: {
					id: 'sender@c.us',
					name: 'John Doe',
					isGroup: false
				},
				group: {
					id: 'group@g.us',
					name: 'Test Group',
					participants: [
						{ id: 'user1@c.us', role: 'admin' },
						{ id: 'user2@c.us', role: 'member' }
					]
				},
				metadata: {
					timestamp: 1640995200,
					forwarded: false,
					broadcast: true,
					readReceipts: ['user1@c.us']
				}
			};

			const webhookData = {
				event: 'message.complex',
				instance: 'test-instance',
				data: complexData,
				createdAt: new Date()
			};

			mockPrisma.webhookEvent.create.mockResolvedValue(undefined);

			await webhookEventRepository.add(webhookData);

			expect(mockPrisma.webhookEvent.create).toHaveBeenCalledWith({
				data: {
					event: webhookData.event,
					instance: webhookData.instance,
					data: complexData,
					createdAt: webhookData.createdAt,
				},
			});
		});

		it('should handle empty and null data values', async () => {
			const testCases = [
				{ data: null },
				{ data: {} },
				{ data: [] },
				{ data: '' },
				{ data: 0 },
				{ data: false },
				{ data: undefined }
			];

			for (const testCase of testCases) {
				const webhookData = {
					event: 'test.event',
					instance: 'test-instance',
					...testCase,
					createdAt: new Date()
				};

				mockPrisma.webhookEvent.create.mockResolvedValue(undefined);

				await webhookEventRepository.add(webhookData);

				expect(mockPrisma.webhookEvent.create).toHaveBeenCalledWith({
					data: {
						event: webhookData.event,
						instance: webhookData.instance,
						data: testCase.data,
						createdAt: webhookData.createdAt,
					},
				});
				
				jest.clearAllMocks();
			}
		});

		it('should handle empty string event and instance', async () => {
			const webhookData = {
				event: '',
				instance: '',
				data: { message: 'test' },
				createdAt: new Date()
			};

			mockPrisma.webhookEvent.create.mockResolvedValue(undefined);

			await webhookEventRepository.add(webhookData);

			expect(mockPrisma.webhookEvent.create).toHaveBeenCalledWith({
				data: {
					event: '',
					instance: '',
					data: webhookData.data,
					createdAt: webhookData.createdAt,
				},
			});
		});

		it('should handle createdAt being undefined (default behavior)', async () => {
			const webhookData = {
				event: 'message.text',
				instance: 'test-instance',
				data: { message: 'Hello' }
				// createdAt is undefined - should use default
			};

			mockPrisma.webhookEvent.create.mockResolvedValue(undefined);

			await webhookEventRepository.add(webhookData);

			expect(mockPrisma.webhookEvent.create).toHaveBeenCalledWith({
				data: {
					event: webhookData.event,
					instance: webhookData.instance,
					data: webhookData.data,
					createdAt: undefined, // Will use Prisma's @default(now())
				},
			});
		});

		it('should handle specific createdAt timestamp', async () => {
			const specificDate = new Date('2023-12-25T12:00:00Z');
			const webhookData = {
				event: 'message.text',
				instance: 'test-instance',
				data: { message: 'Christmas message' },
				createdAt: specificDate
			};

			mockPrisma.webhookEvent.create.mockResolvedValue(undefined);

			await webhookEventRepository.add(webhookData);

			expect(mockPrisma.webhookEvent.create).toHaveBeenCalledWith({
				data: {
					event: webhookData.event,
					instance: webhookData.instance,
					data: webhookData.data,
					createdAt: specificDate,
				},
			});
		});

		it('should handle database errors', async () => {
			const webhookData = {
				event: 'message.text',
				instance: 'test-instance',
				data: { message: 'Hello' },
				createdAt: new Date()
			};
			const error = new Error('Database connection failed');

			mockPrisma.webhookEvent.create.mockRejectedValue(error);

			await expect(webhookEventRepository.add(webhookData))
				.rejects.toThrow('Database connection failed');

			expect(mockPrisma.webhookEvent.create).toHaveBeenCalledWith({
				data: {
					event: webhookData.event,
					instance: webhookData.instance,
					data: webhookData.data,
					createdAt: webhookData.createdAt,
				},
			});
		});

		it('should handle validation errors', async () => {
			const webhookData = {
				event: 'message.text',
				instance: 'test-instance',
				data: { message: 'Hello' },
				createdAt: new Date()
			};
			const error = new Error('Validation failed: Required field missing');

			mockPrisma.webhookEvent.create.mockRejectedValue(error);

			await expect(webhookEventRepository.add(webhookData))
				.rejects.toThrow('Validation failed: Required field missing');
		});

		it('should handle large JSON data payloads', async () => {
			// Create a large data object
			const largeData = {
				messages: Array.from({ length: 100 }, (_, i) => ({
					id: `msg${i}`,
					content: `Message content ${i}`,
					timestamp: Date.now() + i,
					metadata: {
						index: i,
						processed: false,
						tags: Array.from({ length: 10 }, (_, j) => `tag${j}`)
					}
				})),
				participants: Array.from({ length: 50 }, (_, i) => ({
					id: `user${i}@c.us`,
					name: `User ${i}`,
					joinedAt: new Date(2023, 0, i + 1).toISOString(),
					permissions: ['read', 'write', 'mention']
				})),
				groupInfo: {
					settings: {
						allowMemberAdd: true,
						allowMemberRemove: false,
						allowGroupInfoChange: false
					},
					statistics: {
						totalMessages: 10000,
						activeMembers: 45,
						adminCount: 3
					}
				}
			};

			const webhookData = {
				event: 'group.bulk.update',
				instance: 'bulk-processor',
				data: largeData,
				createdAt: new Date()
			};

			mockPrisma.webhookEvent.create.mockResolvedValue(undefined);

			await webhookEventRepository.add(webhookData);

			expect(mockPrisma.webhookEvent.create).toHaveBeenCalledWith({
				data: {
					event: webhookData.event,
					instance: webhookData.instance,
					data: largeData,
					createdAt: webhookData.createdAt,
				},
			});
		});

		it('should handle concurrent webhook additions', async () => {
			const webhookEvents = Array.from({ length: 5 }, (_, i) => ({
				event: `event${i}`,
				instance: `instance${i}`,
				data: { index: i, message: `Concurrent message ${i}` },
				createdAt: new Date(Date.now() + i * 1000)
			}));

			mockPrisma.webhookEvent.create.mockResolvedValue(undefined);

			const promises = webhookEvents.map(webhook => webhookEventRepository.add(webhook));
			await Promise.all(promises);

			expect(mockPrisma.webhookEvent.create).toHaveBeenCalledTimes(5);
			webhookEvents.forEach((webhook, index) => {
				expect(mockPrisma.webhookEvent.create).toHaveBeenNthCalledWith(index + 1, {
					data: {
						event: webhook.event,
						instance: webhook.instance,
						data: webhook.data,
						createdAt: webhook.createdAt,
					},
				});
			});
		});
	});
});