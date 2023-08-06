import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { REQUEST } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { JwtStrategy } from './jwt.strategy';
import * as dotenv from 'dotenv';
import { CreateUser } from './auth.dto';

dotenv.config();

const testUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  organization: 'Test Organization',
  password: bcrypt.hashSync('password', UserService.SALT_OR_ROUNDS),
  categories: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'user',
};

/**
 * Test suite for the AuthService class.
 */
describe('AuthService', () => {
  const userService = {
    findByEmail: jest.fn().mockImplementation((email: string) => {
      return email === 'test@example.com'
        ? Promise.resolve(testUser)
        : Promise.resolve(null);
    }),
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((data: CreateUser) => {
      return Promise.resolve({
        ...testUser,
        ...data,
      });
    }),
    delete: jest.fn(),
  };

  let service: AuthService;

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
        JwtStrategy,
        {
          provide: JwtService,
          useFactory: () => {
            return new JwtService({
              global: true,
              secret: 'secret',
              signOptions: { expiresIn: '1h' },
              verifyOptions: {
                ignoreExpiration: false,
                audience: 'collab-space.com',
              },
            });
          },
        },
        { provide: UserService, useValue: userService },
        { provide: REQUEST, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
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

      expect(payload.user).toEqual(testUser);
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
});
