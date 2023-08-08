import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { Category } from '../category/category.entity';
import { Response } from 'express';
import { CreateUser, LoginUser } from './auth.dto';
import { UnauthorizedException } from '@nestjs/common';
import { JwtToken } from './jwt.strategy';

const testUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  organization: 'Test Organization',
  password: bcrypt.hashSync('password', UserService.SALT_OR_ROUNDS),
  categories: [] as Category[],
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'user',
};

const testUserAuthPayload = {
  user: testUser,
  token: 'sometesttoken',
  exp: Date.now() + 1000 * 60 * 60,
};

const testJwtToken: JwtToken = {
  sub: testUser.id,
  iat: Date.now(),
  exp: Date.now() + 1000 * 60 * 60,
};

/**
 * Test suite for the AuthController class.
 */
describe('AuthController', () => {
  const authService = {
    login: jest.fn().mockImplementation((data: LoginUser) => {
      if (data.email == 'test@example.com' && data.password == 'password') {
        return Promise.resolve(testUserAuthPayload);
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }
    }),
    register: jest.fn().mockImplementation((data: CreateUser) => {
      return Promise.resolve({
        ...testUserAuthPayload,
        user: {
          ...testUser,
          ...data,
        },
      });
    }),
    user: jest.fn().mockResolvedValue(testUser),
    token: jest.fn().mockReturnValue(testJwtToken),
    delete: jest.fn().mockResolvedValue(undefined),
  };

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
          useValue: authService,
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

      expect(authService.register).toHaveBeenCalledWith(mockData);
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

      expect(authService.login).toHaveBeenCalledWith(mockData);
      expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', 'sometesttoken', {
        httpOnly: true,
      });
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('profile', () => {
    it('should return user profile and token expiration', async () => {
      const result = await controller.profile();

      expect(authService.user).toHaveBeenCalled();
      expect(authService.token).toHaveBeenCalled();
      expect(result).toEqual({ user: testUser, exp: testJwtToken.exp });
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
  });

  describe('delete', () => {
    it('should delete the user and return success message', async () => {
      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.delete(mockResponse);

      expect(authService.user).toBeCalled();
      expect(authService.delete).toHaveBeenCalled();
      expect(mockResponse.clearCookie).toBeCalledWith('jwt');
      expect(result).toEqual({ message: 'success' });
    });
  });
});
