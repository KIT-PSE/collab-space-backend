import { Test, TestingModule } from '@nestjs/testing';
import { EditUser, UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { isGuarded } from '../../test/utils';
import { AdminGuard } from '../common/guards/admin.guard';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UnprocessableEntityException } from '@nestjs/common';

const testUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  organization: 'Test Organization',
  password: bcrypt.hashSync('password', UserService.SALT_OR_ROUNDS),
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'user',
} as unknown as User;

/**
 * Test suite to verify the behavior of the UserController.
 */
describe('UserController', () => {
  let controller: UserController;

  /**
   * Before each test case, create a testing module with UserController.
   * Compile the module and obtain an instance of UserController.
   * This ensures a fresh instance is available for each test case.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest
              .fn()
              .mockResolvedValue([
                new User(
                  'Test User 1',
                  'test1@example.com',
                  'Test Org',
                  'password',
                ),
                new User(
                  'Test User 2',
                  'test2@example.com',
                  'Test Org',
                  'password',
                ),
              ]),
            changeRole: jest.fn().mockImplementation((id: number) => {
              if (id === 1) {
                testUser.role = testUser.role === 'user' ? 'admin' : 'user';
                return Promise.resolve(testUser);
              }
              throw new Error('User not found');
            }),
            changeUserData: jest.fn().mockImplementation((data: EditUser) => {
              if (data.id === 1) {
                testUser.name = data.name;
                testUser.email = data.email;
                testUser.organization = data.organization;
                return Promise.resolve(true);
              }
              throw new Error('User not found');
            }),
            delete: jest.fn().mockImplementation((id: number) => {
              if (id === 1) {
                return Promise.resolve(1);
              }
              throw new Error('User not found');
            }),
            changePassword: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: AuthService,
          useValue: {
            user: jest.fn().mockResolvedValue(testUser),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  /**
   * Test case: Ensure that UserController is defined.
   * This test validates that the controller instance was created successfully.
   */
  it('should be defined', () => {
    // Assertion to check if controller is defined
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = await controller.findAll();
      expect(users).toHaveLength(2);
    });

    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.findAll, AuthGuard)).toBe(true);
    });

    it('should be protected with AdminGuard', () => {
      expect(isGuarded(controller.findAll, AdminGuard)).toBe(true);
    });
  });

  describe('changeRole', () => {
    it('should change the role of the user', async () => {
      let user = await controller.changeRole({ id: 1 });
      expect(user.role).toBe('admin');

      user = await controller.changeRole({ id: 1 });
      expect(user.role).toBe('user');
    });

    it('should throw an error if the user is not found', async () => {
      await expect(controller.changeRole({ id: 2 })).rejects.toThrow(
        'User not found',
      );
    });

    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.changeRole, AuthGuard)).toBe(true);
    });

    it('should be protected with AdminGuard', () => {
      expect(isGuarded(controller.changeRole, AdminGuard)).toBe(true);
    });
  });

  describe('changeUserData', () => {
    it('should change the data of the user', async () => {
      const data = {
        id: 1,
        name: 'New Name',
        email: 'newmail@example.com',
        organization: 'New Organization',
      };
      const result = await controller.changeUserData(data);

      expect(result).toBe(true);
      expect(testUser.name).toBe(data.name);
      expect(testUser.email).toBe(data.email);
      expect(testUser.organization).toBe(data.organization);
    });

    it('should throw an error if the user is not found', async () => {
      const data = {
        id: 2,
        name: 'New Name',
        email: 'newmail@example.com',
        organization: 'New Organization',
      };

      await expect(controller.changeUserData(data)).rejects.toThrow(
        'User not found',
      );
    });

    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.changeUserData, AuthGuard)).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete the user', async () => {
      const result = await controller.delete(1);
      expect(result).toEqual({ message: 'success' });
    });

    it('should throw an error if the user is not found', async () => {
      await expect(controller.delete(2)).rejects.toThrow('User not found');
    });

    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.delete, AuthGuard)).toBe(true);
    });

    it('should be protected with AdminGuard', () => {
      expect(isGuarded(controller.delete, AdminGuard)).toBe(true);
    });
  });

  describe('changePassword', () => {
    it('should change the password of the user', async () => {
      const data = {
        currentPassword: 'password',
        newPassword: 'newpassword',
        confirmNewPassword: 'newpassword',
      };
      const result = await controller.changePassword(data);

      expect(result).toBe(true);
    });

    it('should throw an error if the current password is incorrect', async () => {
      const data = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword',
        confirmNewPassword: 'newpassword',
      };

      await expect(controller.changePassword(data)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.changePassword, AuthGuard)).toBe(true);
    });
  });
});
