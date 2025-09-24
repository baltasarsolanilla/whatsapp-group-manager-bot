import request from 'supertest';
import express from 'express';
import routes from '@routes/routes';
import { errorHandler } from '@utils/errorHandler';

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
				const { whitelistService } = require('@logic/services');
				whitelistService.add.mockResolvedValue(undefined);

				const payload = {
					phoneNumber: '+61123456789',
					groupId: 'group-123',
				};

				const response = await request(app)
					.post('/admin/lists/whitelist')
					.send(payload)
					.expect(200);

				expect(whitelistService.add).toHaveBeenCalledWith(
					payload.phoneNumber,
					payload.groupId
				);
				expect(response.body).toEqual({ message: 'Added to whitelist' });
			});

			it('should handle missing parameters', async () => {
				const response = await request(app)
					.post('/admin/lists/whitelist')
					.send({})
					.expect(500);

				expect(response.body).toHaveProperty('error');
			});
		});

		describe('GET /admin/lists/whitelist', () => {
			it('should list whitelist entries', async () => {
				const { whitelistService } = require('@logic/services');
				const mockMembers = [{ id: '1', phoneNumber: '+61123456789' }];
				whitelistService.list.mockResolvedValue(mockMembers);

				const response = await request(app)
					.get('/admin/lists/whitelist')
					.expect(200);

				expect(whitelistService.list).toHaveBeenCalledWith(undefined);
				expect(response.body).toEqual(mockMembers);
			});

			it('should filter by groupId', async () => {
				const { whitelistService } = require('@logic/services');
				const mockMembers = [{ id: '1', phoneNumber: '+61123456789' }];
				whitelistService.list.mockResolvedValue(mockMembers);

				const response = await request(app)
					.get('/admin/lists/whitelist')
					.query({ groupId: 'group-123' })
					.expect(200);

				expect(whitelistService.list).toHaveBeenCalledWith('group-123');
			});
		});

		describe('DELETE /admin/lists/whitelist', () => {
			it('should remove user from whitelist', async () => {
				const { whitelistService } = require('@logic/services');
				whitelistService.remove.mockResolvedValue(undefined);

				const payload = {
					phoneNumber: '+61123456789',
					groupId: 'group-123',
				};

				const response = await request(app)
					.delete('/admin/lists/whitelist')
					.send(payload)
					.expect(200);

				expect(whitelistService.remove).toHaveBeenCalledWith(
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
				const { blacklistService } = require('@logic/services');
				blacklistService.add.mockResolvedValue(undefined);

				const payload = {
					phoneNumber: '+61123456789',
					groupId: 'group-123',
				};

				const response = await request(app)
					.post('/admin/lists/blacklist')
					.send(payload)
					.expect(200);

				expect(blacklistService.add).toHaveBeenCalledWith(
					payload.phoneNumber,
					payload.groupId
				);
				expect(response.body).toEqual({ message: 'Added to blacklist' });
			});
		});

		describe('GET /admin/lists/blacklist', () => {
			it('should list blacklist entries', async () => {
				const { blacklistService } = require('@logic/services');
				const mockMembers = [{ id: '1', phoneNumber: '+61123456789' }];
				blacklistService.list.mockResolvedValue(mockMembers);

				const response = await request(app)
					.get('/admin/lists/blacklist')
					.expect(200);

				expect(blacklistService.list).toHaveBeenCalledWith(undefined);
				expect(response.body).toEqual(mockMembers);
			});
		});

		describe('DELETE /admin/lists/blacklist', () => {
			it('should remove user from blacklist', async () => {
				const { blacklistService } = require('@logic/services');
				blacklistService.remove.mockResolvedValue(undefined);

				const payload = {
					phoneNumber: '+61123456789',
					groupId: 'group-123',
				};

				const response = await request(app)
					.delete('/admin/lists/blacklist')
					.send(payload)
					.expect(200);

				expect(blacklistService.remove).toHaveBeenCalledWith(
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
				const { removalQueueService } = require('@logic/services');
				const mockQueue = [{ id: '1', userId: 'user-1', groupId: 'group-1' }];
				removalQueueService.list.mockResolvedValue(mockQueue);

				const response = await request(app)
					.get('/admin/removalQueue')
					.expect(200);

				expect(removalQueueService.list).toHaveBeenCalled();
				expect(response.body).toEqual(mockQueue);
			});
		});

		describe('POST /admin/removalQueue/run', () => {
			it('should run removal queue', async () => {
				const { removalQueueService } = require('@logic/services');
				removalQueueService.runQueue.mockResolvedValue({ processed: 5 });

				const response = await request(app)
					.post('/admin/removalQueue/run')
					.expect(200);

				expect(removalQueueService.runQueue).toHaveBeenCalled();
			});
		});

		describe('POST /admin/removalQueue/sync', () => {
			it('should sync removal queue', async () => {
				const { removalQueueService } = require('@logic/services');
				removalQueueService.syncQueue.mockResolvedValue({ synced: 10 });

				const response = await request(app)
					.post('/admin/removalQueue/sync')
					.expect(200);

				expect(removalQueueService.syncQueue).toHaveBeenCalled();
			});
		});

		describe('POST /admin/removalQueue/runWorkflow', () => {
			it('should run workflow', async () => {
				const { removalWorkflowService } = require('@logic/services');
				removalWorkflowService.runWorkflow.mockResolvedValue({ completed: true });

				const response = await request(app)
					.post('/admin/removalQueue/runWorkflow')
					.expect(200);

				expect(removalWorkflowService.runWorkflow).toHaveBeenCalled();
			});
		});
	});

	describe('Group Management', () => {
		describe('POST /admin/groups/ingest', () => {
			it('should ingest group data', async () => {
				const { groupService } = require('@logic/services');
				groupService.ingest.mockResolvedValue({ processed: true });

				const payload = { groupId: 'group-123' };

				const response = await request(app)
					.post('/admin/groups/ingest')
					.send(payload)
					.expect(200);

				expect(groupService.ingest).toHaveBeenCalled();
			});
		});

		describe('PATCH /admin/groups/:id', () => {
			it('should update group', async () => {
				const { groupService } = require('@logic/services');
				groupService.update.mockResolvedValue({ updated: true });

				const payload = { name: 'Updated Group Name' };

				const response = await request(app)
					.patch('/admin/groups/123')
					.send(payload)
					.expect(200);

				expect(groupService.update).toHaveBeenCalled();
			});
		});
	});
});