import { resolveUser } from './baseMemberListService';
import { userRepository } from '@database/repositories';
import { AppError } from '@utils/AppError';

// Mock the userRepository
jest.mock('@database/repositories', () => ({
	userRepository: {
		getByWaId: jest.fn(),
		getByPn: jest.fn(),
		createByWaId: jest.fn(),
		createByPn: jest.fn(),
	},
	groupRepository: {
		getByWaId: jest.fn(),
	},
}));

describe('resolveUser', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('validation', () => {
		it('should throw error when both phoneNumber and whatsappId are provided', async () => {
			await expect(
				resolveUser('+1234567890', '69918158549171@lid')
			).rejects.toThrow(AppError);
			await expect(
				resolveUser('+1234567890', '69918158549171@lid')
			).rejects.toThrow('Provide either phoneNumber or whatsappId, not both');
		});

		it('should throw error when neither phoneNumber nor whatsappId are provided', async () => {
			await expect(resolveUser()).rejects.toThrow(AppError);
			await expect(resolveUser()).rejects.toThrow(
				'Either phoneNumber or whatsappId is required'
			);
		});

		it('should throw error for invalid whatsappId format', async () => {
			await expect(resolveUser(undefined, 'invalid-format')).rejects.toThrow(
				AppError
			);
			await expect(resolveUser(undefined, 'invalid-format')).rejects.toThrow(
				'Invalid whatsappId format'
			);
		});
	});

	describe('whatsappId flow', () => {
		it('should return existing user when found by whatsappId', async () => {
			const mockUser = {
				id: 'user-123',
				whatsappId: '69918158549171@lid',
				whatsappPn: null,
				name: null,
				createdAt: new Date(),
			};

			(userRepository.getByWaId as jest.Mock).mockResolvedValue(mockUser);

			const result = await resolveUser(undefined, '69918158549171@lid');

			expect(result).toEqual(mockUser);
			expect(userRepository.getByWaId).toHaveBeenCalledWith(
				'69918158549171@lid'
			);
			expect(userRepository.createByWaId).not.toHaveBeenCalled();
		});

		it('should create new user when not found by whatsappId', async () => {
			const mockNewUser = {
				id: 'user-new',
				whatsappId: '69918158549171@lid',
				whatsappPn: null,
				name: null,
				createdAt: new Date(),
			};

			(userRepository.getByWaId as jest.Mock).mockResolvedValue(null);
			(userRepository.createByWaId as jest.Mock).mockResolvedValue(mockNewUser);

			const result = await resolveUser(undefined, '69918158549171@lid');

			expect(result).toEqual(mockNewUser);
			expect(userRepository.getByWaId).toHaveBeenCalledWith(
				'69918158549171@lid'
			);
			expect(userRepository.createByWaId).toHaveBeenCalledWith(
				'69918158549171@lid'
			);
		});
	});

	describe('phoneNumber flow', () => {
		it('should return existing user when found by phoneNumber', async () => {
			const mockUser = {
				id: 'user-456',
				whatsappId: null,
				whatsappPn: '61476554841@s.whatsapp.net',
				name: null,
				createdAt: new Date(),
			};

			(userRepository.getByPn as jest.Mock).mockResolvedValue(mockUser);

			const result = await resolveUser('+61476554841');

			expect(result).toEqual(mockUser);
			expect(userRepository.getByPn).toHaveBeenCalledWith(
				'61476554841@s.whatsapp.net'
			);
			expect(userRepository.createByPn).not.toHaveBeenCalled();
		});

		it('should create new user when not found by phoneNumber', async () => {
			const mockNewUser = {
				id: 'user-new-2',
				whatsappId: null,
				whatsappPn: '61476554841@s.whatsapp.net',
				name: null,
				createdAt: new Date(),
			};

			(userRepository.getByPn as jest.Mock).mockResolvedValue(null);
			(userRepository.createByPn as jest.Mock).mockResolvedValue(mockNewUser);

			const result = await resolveUser('+61476554841');

			expect(result).toEqual(mockNewUser);
			expect(userRepository.getByPn).toHaveBeenCalledWith(
				'61476554841@s.whatsapp.net'
			);
			expect(userRepository.createByPn).toHaveBeenCalledWith(
				'61476554841@s.whatsapp.net'
			);
		});

		it('should handle phoneNumber without leading +', async () => {
			const mockNewUser = {
				id: 'user-new-3',
				whatsappId: null,
				whatsappPn: '1234567890@s.whatsapp.net',
				name: null,
				createdAt: new Date(),
			};

			(userRepository.getByPn as jest.Mock).mockResolvedValue(null);
			(userRepository.createByPn as jest.Mock).mockResolvedValue(mockNewUser);

			const result = await resolveUser('1234567890');

			expect(result).toEqual(mockNewUser);
			expect(userRepository.getByPn).toHaveBeenCalledWith(
				'1234567890@s.whatsapp.net'
			);
			expect(userRepository.createByPn).toHaveBeenCalledWith(
				'1234567890@s.whatsapp.net'
			);
		});
	});

	afterAll(() => {
		console.log('✅ resolveUser auto-creation functionality validated');
	});
});
