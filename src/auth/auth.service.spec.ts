import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { REQUEST } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { jwtModuleConfig } from './auth.module';
import { Category } from '../category/category.entity';
import { MockUserService } from '../user/mock/user.service.mock';
import { User } from '../user/user.entity';

dotenv.config();

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
 * Test suite for the AuthService class.
 */
describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;

  /**
   * Executes before each individual test case.
   * Creates a TestingModule containing the AuthService.
   * Retrieves an instance of AuthService from the module.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useFactory: () => {
            return new JwtService(jwtModuleConfig);
          },
        },
        { provide: UserService, useValue: new MockUserService(TEST_USER) },
        {
          provide: REQUEST,
          useValue: {
            user: {
              sub: TEST_USER.id,
              exp: Date.now() + 1000 * 60 * 60,
              iat: Date.now(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  /**
   * Single test case: Verifies if the AuthService is defined.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return an authentication payload', async () => {
      const payload = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(payload.user).toEqual(TEST_USER);
    });

    /**
     * Die Eingabe fehlerhafter Angaben (z.B. E-Mail welche gar nicht zu einem Account
     * gehört) wird noch nicht abgefangen.
     */
    it('should throw an error if the user is not found', async () => {
      await expect(
        service.login({
          email: 'wrong-email@example.com',
          password: 'password',
        }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw an error if the password is incorrect', async () => {
      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should return an authentication payload', async () => {
      const payload = await service.register({
        name: 'New Test User',
        organization: 'Test Organization',
        email: 'test@example.com',
        password: 'password',
      });

      expect(payload.user.name).toEqual('New Test User');
    });
  });

  describe('updateUser', () => {
    it('should update the authenticated user', async () => {
      const updatedUser = await service.updateUser({
        name: 'New Test User',
        organization: 'New Test Organization',
        email: 'newmail@example.com',
      });

      expect(updatedUser.name).toEqual('New Test User');
      expect(updatedUser.organization).toEqual('New Test Organization');
      expect(updatedUser.email).toEqual('newmail@example.com');
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      userService.delete = jest.fn();
      await service.delete(1);
      expect(userService.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('user', () => {
    it('should return the currently authenticated user', async () => {
      const user = await service.user();
      expect(user).toEqual(TEST_USER);
    });
  });

  describe('token', () => {
    it('should return a token', async () => {
      const token = await service.token();
      expect(token).toBeDefined();
    });
  });
});
