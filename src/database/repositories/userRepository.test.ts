import { userRepository } from '@database/repositories/userRepository';
import mockPrisma from '@database/__mocks__/prisma';

// Mock the prisma module
jest.mock('@database/prisma', () => mockPrisma);

describe('userRepository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('upsert', () => {
		it('should upsert user with all parameters', async () => {
			const userData = {
				whatsappId: 'wa123@c.us',
				whatsappPn: '+1234567890',
				name: 'John Doe'
			};
			const mockUser = {
				id: 'user1',
				...userData,
				createdAt: new Date()
			};

			mockPrisma.user.upsert.mockResolvedValue(mockUser);

			const result = await userRepository.upsert(userData);

			expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
				where: { whatsappId: userData.whatsappId },
				update: { name: userData.name, whatsappPn: userData.whatsappPn },
				create: { 
					whatsappId: userData.whatsappId, 
					name: userData.name, 
					whatsappPn: userData.whatsappPn 
				},
			});
			expect(result).toEqual(mockUser);
		});

		it('should upsert user with only whatsappId', async () => {
			const userData = {
				whatsappId: 'wa123@c.us'
			};
			const mockUser = {
				id: 'user1',
				whatsappId: userData.whatsappId,
				whatsappPn: null,
				name: null,
				createdAt: new Date()
			};

			mockPrisma.user.upsert.mockResolvedValue(mockUser);

			const result = await userRepository.upsert(userData);

			expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
				where: { whatsappId: userData.whatsappId },
				update: {},
				create: { whatsappId: userData.whatsappId },
			});
			expect(result).toEqual(mockUser);
		});

		it('should handle undefined name and whatsappPn properly', async () => {
			const userData = {
				whatsappId: 'wa123@c.us',
				whatsappPn: undefined,
				name: undefined
			};
			const mockUser = {
				id: 'user1',
				whatsappId: userData.whatsappId,
				whatsappPn: null,
				name: null,
				createdAt: new Date()
			};

			mockPrisma.user.upsert.mockResolvedValue(mockUser);

			const result = await userRepository.upsert(userData);

			expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
				where: { whatsappId: userData.whatsappId },
				update: {},
				create: { whatsappId: userData.whatsappId },
			});
			expect(result).toEqual(mockUser);
		});

		it('should handle falsy values (empty strings) for name and whatsappPn', async () => {
			const userData = {
				whatsappId: 'wa123@c.us',
				whatsappPn: '',
				name: ''
			};
			const mockUser = {
				id: 'user1',
				whatsappId: userData.whatsappId,
				whatsappPn: '',
				name: '',
				createdAt: new Date()
			};

			mockPrisma.user.upsert.mockResolvedValue(mockUser);

			const result = await userRepository.upsert(userData);

			expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
				where: { whatsappId: userData.whatsappId },
				update: {},
				create: { whatsappId: userData.whatsappId },
			});
			expect(result).toEqual(mockUser);
		});

		it('should handle truthy values for name and whatsappPn in update', async () => {
			const userData = {
				whatsappId: 'wa123@c.us',
				whatsappPn: '+1234567890',
				name: 'John Doe'
			};
			const mockUser = {
				id: 'user1',
				...userData,
				createdAt: new Date()
			};

			mockPrisma.user.upsert.mockResolvedValue(mockUser);

			const result = await userRepository.upsert(userData);

			expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
				where: { whatsappId: userData.whatsappId },
				update: { name: userData.name, whatsappPn: userData.whatsappPn },
				create: { 
					whatsappId: userData.whatsappId, 
					name: userData.name, 
					whatsappPn: userData.whatsappPn 
				},
			});
			expect(result).toEqual(mockUser);
		});

		it('should handle database errors', async () => {
			const userData = {
				whatsappId: 'wa123@c.us',
				name: 'John Doe'
			};
			const error = new Error('Database connection failed');

			mockPrisma.user.upsert.mockRejectedValue(error);

			await expect(userRepository.upsert(userData))
				.rejects.toThrow('Database connection failed');

			expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
				where: { whatsappId: userData.whatsappId },
				update: { name: userData.name },
				create: { whatsappId: userData.whatsappId, name: userData.name },
			});
		});

		it('should handle mixed scenarios with some defined and some undefined values', async () => {
			const userData = {
				whatsappId: 'wa123@c.us',
				whatsappPn: '+1234567890',
				name: undefined
			};
			const mockUser = {
				id: 'user1',
				whatsappId: userData.whatsappId,
				whatsappPn: userData.whatsappPn,
				name: null,
				createdAt: new Date()
			};

			mockPrisma.user.upsert.mockResolvedValue(mockUser);

			const result = await userRepository.upsert(userData);

			expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
				where: { whatsappId: userData.whatsappId },
				update: { whatsappPn: userData.whatsappPn },
				create: { whatsappId: userData.whatsappId, whatsappPn: userData.whatsappPn },
			});
			expect(result).toEqual(mockUser);
		});
	});

	describe('getByWaId', () => {
		it('should return user when found', async () => {
			const whatsappId = 'wa123@c.us';
			const mockUser = {
				id: 'user1',
				whatsappId,
				whatsappPn: '+1234567890',
				name: 'John Doe',
				createdAt: new Date()
			};

			mockPrisma.user.findUnique.mockResolvedValue(mockUser);

			const result = await userRepository.getByWaId(whatsappId);

			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { whatsappId }
			});
			expect(result).toEqual(mockUser);
		});

		it('should return null when user not found', async () => {
			const whatsappId = 'nonexistent@c.us';

			mockPrisma.user.findUnique.mockResolvedValue(null);

			const result = await userRepository.getByWaId(whatsappId);

			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { whatsappId }
			});
			expect(result).toBeNull();
		});

		it('should handle empty string whatsappId', async () => {
			const whatsappId = '';

			mockPrisma.user.findUnique.mockResolvedValue(null);

			const result = await userRepository.getByWaId(whatsappId);

			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { whatsappId }
			});
			expect(result).toBeNull();
		});

		it('should handle database errors', async () => {
			const whatsappId = 'wa123@c.us';
			const error = new Error('Database query failed');

			mockPrisma.user.findUnique.mockRejectedValue(error);

			await expect(userRepository.getByWaId(whatsappId))
				.rejects.toThrow('Database query failed');
		});
	});

	describe('getByPn', () => {
		it('should return user when found by phone number', async () => {
			const whatsappPn = '+1234567890';
			const mockUser = {
				id: 'user1',
				whatsappId: 'wa123@c.us',
				whatsappPn,
				name: 'John Doe',
				createdAt: new Date()
			};

			mockPrisma.user.findUnique.mockResolvedValue(mockUser);

			const result = await userRepository.getByPn(whatsappPn);

			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { whatsappPn }
			});
			expect(result).toEqual(mockUser);
		});

		it('should return null when user not found by phone number', async () => {
			const whatsappPn = '+9876543210';

			mockPrisma.user.findUnique.mockResolvedValue(null);

			const result = await userRepository.getByPn(whatsappPn);

			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { whatsappPn }
			});
			expect(result).toBeNull();
		});

		it('should handle empty string phone number', async () => {
			const whatsappPn = '';

			mockPrisma.user.findUnique.mockResolvedValue(null);

			const result = await userRepository.getByPn(whatsappPn);

			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { whatsappPn }
			});
			expect(result).toBeNull();
		});

		it('should handle database errors', async () => {
			const whatsappPn = '+1234567890';
			const error = new Error('Database query failed');

			mockPrisma.user.findUnique.mockRejectedValue(error);

			await expect(userRepository.getByPn(whatsappPn))
				.rejects.toThrow('Database query failed');
		});
	});
});