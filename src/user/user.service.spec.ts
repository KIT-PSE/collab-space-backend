import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { EntityManager } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { MockUserRepository } from './mock/user.repository.mock';
import { UpdateUser } from '../auth/auth.dto';

const TEST_USER = {
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
 * Test suite for UserService.
 */
describe('UserService', () => {
  let service: UserService;
  let entityManager: EntityManager;
  let repository: MockUserRepository;

  /**
   * Before each test case, create a testing module and compile it.
   * Obtain an instance of UserService for testing.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: EntityManager,
          useValue: {
            persistAndFlush: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: new MockUserRepository(TEST_USER),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    entityManager = module.get<EntityManager>(EntityManager);
    repository = module.get<MockUserRepository>(getRepositoryToken(User));
  });

  /**
   * Test case to verify that UserService is defined.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = await service.findOne(1);
      expect(user).toEqual(TEST_USER);
    });

    it('should return null if no user is found', async () => {
      const user = await service.findOne(2);
      expect(user).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = await service.findByEmail('test@example.com');
      expect(user).toEqual(TEST_USER);
    });

    it('should return null if no user is found', async () => {
      const user = await service.findByEmail('wrongemail@example.com');
      expect(user).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = await service.findAll();
      expect(users).toHaveLength(2);
    });
  });

  describe('find', () => {
    it('should return users by ids', async () => {
      const users = await service.find([1, 2]);
      expect(users).toHaveLength(2);
    });

    it('should return only users with matching ids', async () => {
      const users = await service.find([1, 3]);
      expect(users).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUser = {
        name: 'New Test User',
        email: 'newtest@example.com',
        organization: 'Test Org',
        password: 'password',
      };
      const user = await service.create(createUser);

      expect(user.name).toEqual(createUser.name);
      expect(user.email).toEqual(createUser.email);
      expect(user.organization).toEqual(createUser.organization);
      expect(entityManager.persistAndFlush).toHaveBeenCalled();
    });

    it('should not store the password in plain text', async () => {
      const createUser = {
        name: 'New Test User',
        email: 'newtest@example.com',
        organization: 'Test Org',
        password: 'password',
      };

      const user = await service.create(createUser);
      expect(user.password).not.toEqual(createUser.password);
    });
  });

  describe('changePassword', () => {
    it('should change the password', async () => {
      const prevPassword = TEST_USER.password;
      await service.changePassword(TEST_USER, 'newpassword');

      expect(TEST_USER.password).not.toEqual(prevPassword);
      expect(entityManager.persistAndFlush).toHaveBeenCalled();
    });

    it('should not store the password in plain text', async () => {
      await service.changePassword(TEST_USER, 'newpassword');
      expect(TEST_USER.password).not.toEqual('newpassword');
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const result = await service.delete(1);
      expect(result).toEqual(1);
    });

    it('should throw an error if the user does not exist', async () => {
      await expect(service.delete(2)).rejects.toThrowError('User not found');
    });
  });

  describe('isEmailTakenNotBy', () => {
    it('should return true if the email is taken', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce({
        ...TEST_USER,
        email: 'test2@example.com',
        id: 2,
      });
      const result = await service.isEmailTakenNotBy(
        TEST_USER,
        'test2@example.com',
      );
      expect(result).toBeTruthy();
    });

    it('should return false if the email is not taken', async () => {
      const result = await service.isEmailTakenNotBy(
        TEST_USER,
        'nottaken@example.com',
      );
      expect(result).toBeFalsy();
    });

    it('should return false if the email is taken by the same user', async () => {
      const result = await service.isEmailTakenNotBy(
        TEST_USER,
        'test@example.com',
      );
      expect(result).toBeFalsy();
    });
  });

  describe('update', () => {
    it('should change the user data', async () => {
      const updateUser: UpdateUser = {
        name: 'Updated Test User',
        email: 'updatedmail@example.com',
        organization: 'Updated Test Org',
      };
      const result = await service.update(TEST_USER, updateUser);

      expect(TEST_USER.name).toEqual(updateUser.name);
      expect(TEST_USER.email).toEqual(updateUser.email);
      expect(TEST_USER.organization).toEqual(updateUser.organization);
      expect(entityManager.persistAndFlush).toHaveBeenCalled();

      expect(result).toEqual({ ...TEST_USER, ...updateUser });
    });
  });

  describe('changeRole', () => {
    it('should toggle the role', async () => {
      let user = await service.changeRole(1);
      expect(user.role).toEqual('admin');
      expect(entityManager.persistAndFlush).toHaveBeenCalledTimes(1);

      user = await service.changeRole(1);
      expect(user.role).toEqual('user');
      expect(entityManager.persistAndFlush).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if the user does not exist', async () => {
      await expect(service.changeRole(2)).rejects.toThrowError(
        'User not found',
      );
    });
  });
});
