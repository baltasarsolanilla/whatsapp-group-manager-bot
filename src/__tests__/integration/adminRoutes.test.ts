import request from 'supertest';
import express from 'express';
import routes from '@routes/routes';
import { errorHandler } from '@utils/errorHandler';
import * as services from '@logic/services';

// Mock all the services
jest.mock('@logic/services', () => ({
	whitelistService: {
		add: jest.fn(),
		remove: jest.fn(),
		list: jest.fn(),
	},
	blacklistService: {
		add: jest.fn(),
		remove: jest.fn(),
		list: jest.fn(),
	},
	removalQueueService: {
		list: jest.fn(),
		runQueue: jest.fn(),
		syncQueue: jest.fn(),
	},
	removalWorkflowService: {
		runWorkflow: jest.fn(),
	},
	groupService: {
		ingest: jest.fn(),
		update: jest.fn(),
	},
}));

// Type the mocked services
const mockedServices = services as jest.Mocked<typeof services>;

const createTestApp = () => {
	const app = express();
	app.use(express.json());
	app.use('/', routes);
	app.use(errorHandler);
	return app;
};

describe('Admin API Integration Tests', () => {
	let app: express.Application;

	beforeEach(() => {
		app = createTestApp();
		jest.clearAllMocks();
	});

	describe('Whitelist Management', () => {
		describe('POST /admin/lists/whitelist', () => {
			it('should add user to whitelist', async () => {
				mockedServices.whitelistService.add.mockResolvedValue(undefined);

				const payload = {
					phoneNumber: '+61123456789',
					groupId: 'group-123',
				};

				const response = await request(app)
					.post('/admin/lists/whitelist')
					.send(payload)
					.expect(200);

				expect(mockedServices.whitelistService.add).toHaveBeenCalledWith(
					payload.phoneNumber,
					payload.groupId
				);
				expect(response.body).toEqual({ message: 'Added to whitelist' });
			});

			it('should handle missing parameters', async () => {
				await request(app)
					.post('/admin/lists/whitelist')
					.send({})
					.expect(500);
			});
		});

		describe('GET /admin/lists/whitelist', () => {
			it('should list whitelist entries', async () => {
				const mockMembers = [{ id: '1', phoneNumber: '+61123456789' }];
				mockedServices.whitelistService.list.mockResolvedValue(mockMembers);

				const response = await request(app)
					.get('/admin/lists/whitelist')
					.expect(200);

				expect(mockedServices.whitelistService.list).toHaveBeenCalledWith(undefined);
				expect(response.body).toEqual(mockMembers);
			});

			it('should filter by groupId', async () => {
				const mockMembers = [{ id: '1', phoneNumber: '+61123456789' }];
				mockedServices.whitelistService.list.mockResolvedValue(mockMembers);

				await request(app)
					.get('/admin/lists/whitelist')
					.query({ groupId: 'group-123' })
					.expect(200);

				expect(mockedServices.whitelistService.list).toHaveBeenCalledWith('group-123');
			});
		});

		describe('DELETE /admin/lists/whitelist', () => {
			it('should remove user from whitelist', async () => {
				mockedServices.whitelistService.remove.mockResolvedValue(undefined);

				const payload = {
					phoneNumber: '+61123456789',
					groupId: 'group-123',
				};

				const response = await request(app)
					.delete('/admin/lists/whitelist')
					.send(payload)
					.expect(200);

				expect(mockedServices.whitelistService.remove).toHaveBeenCalledWith(
					payload.phoneNumber,
					payload.groupId
				);
				expect(response.body).toEqual({ message: 'Removed from whitelist' });
			});
		});
	});

	describe('Blacklist Management', () => {
		describe('POST /admin/lists/blacklist', () => {
			it('should add user to blacklist', async () => {
				mockedServices.blacklistService.add.mockResolvedValue(undefined);

				const payload = {
					phoneNumber: '+61123456789',
					groupId: 'group-123',
				};

				const response = await request(app)
					.post('/admin/lists/blacklist')
					.send(payload)
					.expect(200);

				expect(mockedServices.blacklistService.add).toHaveBeenCalledWith(
					payload.phoneNumber,
					payload.groupId
				);
				expect(response.body).toEqual({ message: 'Added to blacklist' });
			});
		});

		describe('GET /admin/lists/blacklist', () => {
			it('should list blacklist entries', async () => {
				const mockMembers = [{ id: '1', phoneNumber: '+61123456789' }];
				mockedServices.blacklistService.list.mockResolvedValue(mockMembers);

				const response = await request(app)
					.get('/admin/lists/blacklist')
					.expect(200);

				expect(mockedServices.blacklistService.list).toHaveBeenCalledWith(undefined);
				expect(response.body).toEqual(mockMembers);
			});
		});

		describe('DELETE /admin/lists/blacklist', () => {
			it('should remove user from blacklist', async () => {
				mockedServices.blacklistService.remove.mockResolvedValue(undefined);

				const payload = {
					phoneNumber: '+61123456789',
					groupId: 'group-123',
				};

				const response = await request(app)
					.delete('/admin/lists/blacklist')
					.send(payload)
					.expect(200);

				expect(mockedServices.blacklistService.remove).toHaveBeenCalledWith(
					payload.phoneNumber,
					payload.groupId
				);
				expect(response.body).toEqual({ message: 'Removed from blacklist' });
			});
		});
	});

	describe('Removal Queue Management', () => {
		describe('GET /admin/removalQueue', () => {
			it('should list removal queue entries', async () => {
				const mockQueue = [{ id: '1', userId: 'user-1', groupId: 'group-1' }];
				mockedServices.removalQueueService.list.mockResolvedValue(mockQueue);

				const response = await request(app)
					.get('/admin/removalQueue')
					.expect(200);

				expect(mockedServices.removalQueueService.list).toHaveBeenCalled();
				expect(response.body).toEqual(mockQueue);
			});
		});

		describe('POST /admin/removalQueue/run', () => {
			it('should run removal queue', async () => {
				mockedServices.removalQueueService.runQueue.mockResolvedValue({ processed: 5 });

				await request(app).post('/admin/removalQueue/run').expect(200);

				expect(mockedServices.removalQueueService.runQueue).toHaveBeenCalled();
			});
		});

		describe('POST /admin/removalQueue/sync', () => {
			it('should sync removal queue', async () => {
				mockedServices.removalQueueService.syncQueue.mockResolvedValue({ synced: 10 });

				await request(app).post('/admin/removalQueue/sync').expect(200);

				expect(mockedServices.removalQueueService.syncQueue).toHaveBeenCalled();
			});
		});

		describe('POST /admin/removalQueue/runWorkflow', () => {
			it('should run workflow', async () => {
				mockedServices.removalWorkflowService.runWorkflow.mockResolvedValue({
					completed: true,
				});

				await request(app).post('/admin/removalQueue/runWorkflow').expect(200);

				expect(mockedServices.removalWorkflowService.runWorkflow).toHaveBeenCalled();
			});
		});
	});

	describe('Group Management', () => {
		describe('POST /admin/groups/ingest', () => {
			it('should ingest group data', async () => {
				mockedServices.groupService.ingest.mockResolvedValue({ processed: true });

				const payload = { groupId: 'group-123' };

				await request(app)
					.post('/admin/groups/ingest')
					.send(payload)
					.expect(200);

				expect(mockedServices.groupService.ingest).toHaveBeenCalled();
			});
		});

		describe('PATCH /admin/groups/:id', () => {
			it('should update group', async () => {
				mockedServices.groupService.update.mockResolvedValue({ updated: true });

				const payload = { name: 'Updated Group Name' };

				await request(app)
					.patch('/admin/groups/123')
					.send(payload)
					.expect(200);

				expect(mockedServices.groupService.update).toHaveBeenCalled();
			});
		});
	});
});
