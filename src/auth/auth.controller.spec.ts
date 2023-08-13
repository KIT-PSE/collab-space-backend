import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { Category } from '../category/category.entity';
import { Response } from 'express';
import { isGuarded } from '../../test/utils';
import { AuthGuard } from './auth.guard';
import { MockAuthService } from './mock/auth.service.mock';
import { User } from '../user/user.entity';

const TEST_USER = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  organization: 'Test Organization',
  password: bcrypt.hashSync('password', UserService.SALT_OR_ROUNDS),
  categories: [] as Category[],
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'user',
} as unknown as User;

/**
 * Test suite for the AuthController class.
 */
describe('AuthController', () => {
  let controller: AuthController;

  /**
   * Executes before each individual test case.
   * Creates a TestingModule containing the AuthController.
   * Retrieves an instance of AuthController from the module.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: new MockAuthService(TEST_USER),
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  /**
   * Single test case: Verifies if the AuthController is defined.
   */
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should set a cookie and return the registration payload', async () => {
      const mockData = {
        name: 'Test User',
        email: 'test@example.com',
        organization: 'Test Organization',
        password: 'password',
        confirmPassword: 'password',
      };

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.register(mockData, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', 'sometesttoken', {
        httpOnly: true,
      });
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('login', () => {
    it('should set a cookie and return the authentication payload', async () => {
      const mockData = {
        email: 'test@example.com',
        password: 'password',
      };

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.login(mockData, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', 'sometesttoken', {
        httpOnly: true,
      });
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('profile', () => {
    it('should return user profile and token expiration', async () => {
      const result = await controller.profile();

      expect(result.user).toEqual(TEST_USER);
      expect(result.exp).toBeLessThanOrEqual(Date.now() + 1000 * 60 * 60);
    });

    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.profile, AuthGuard)).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear jwt cookie and return success message', async () => {
      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('jwt');
      expect(result).toEqual({ message: 'success' });
    });

    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.logout, AuthGuard)).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete the user and return success message', async () => {
      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.delete(mockResponse);

      expect(mockResponse.clearCookie).toBeCalledWith('jwt');
      expect(result).toEqual({ message: 'success' });
    });

    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.delete, AuthGuard)).toBe(true);
    });
  });
});
