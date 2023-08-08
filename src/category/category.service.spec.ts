import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Category } from './category.entity';
import { EntityManager } from '@mikro-orm/core';
import { ChannelService } from '../channel/channel.service';
import { User } from '../user/user.entity';
import { Room } from '../room/room.entity';

const categories = [];
for (let i = 0; i < 5; i++) {
  categories.push(new Category(`Category ${i}`, undefined));
  categories[i].rooms = [new Room(`Room ${i}`, categories[i])];
}

const testUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  organization: 'Test Organization',
  categories: {
    loadItems: jest.fn().mockResolvedValue(categories),
  },
  password: 'password',
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'user',
} as unknown as User;

/**
 * Test suite for the CategoryService class.
 */
describe('CategoryService', () => {
  let service: CategoryService;
  let channels: ChannelService;
  let entityManager: EntityManager;

  /**
   * Setup before each test case by creating a testing module and
   * obtaining an instance of the CategoryService.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: EntityManager,
          useValue: {
            persistAndFlush: jest.fn(),
            removeAndFlush: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {
            findOneOrFail: jest.fn().mockImplementation((data) => {
              if (data.id === 1) {
                return Promise.resolve({
                  id: 1,
                  name: 'Test Category',
                  owner: testUser,
                  rooms: [],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
              } else {
                throw new Error('Category not found');
              }
            }),
          },
        },
        {
          provide: ChannelService,
          useValue: {
            getChannelFromRoom: jest.fn().mockReturnValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    channels = module.get<ChannelService>(ChannelService);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  /**
   * Test case to check if the CategoryService instance is defined.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('allFromUser', () => {
    it('should return all categories for a user', async () => {
      const categories = await service.allFromUser(testUser);

      expect(testUser.categories.loadItems).toBeCalledWith({
        populate: ['rooms'],
      });
      expect(channels.getChannelFromRoom).toHaveBeenCalledTimes(5);
      expect(categories).toHaveLength(5);
    });
  });

  describe('get', () => {
    it('should return a category', async () => {
      const category = await service.get(1, testUser);

      expect(category).toBeDefined();
      expect(category.id).toBe(1);
    });

    it('should throw an error if the category does not exist', async () => {
      await expect(service.get(2, testUser)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      const category = await service.create('Test Category', testUser);

      expect(category).toBeDefined();
      expect(category.name).toBe('Test Category');
      expect(category.owner).toBe(testUser);
      expect(entityManager.persistAndFlush).toBeCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const category = await service.update(1, testUser, 'Updated Name');

      expect(category).toBeDefined();
      expect(category.name).toBe('Updated Name');
      expect(entityManager.persistAndFlush).toBeCalledTimes(1);
    });

    it('should throw an error if the category does not exist', async () => {
      await expect(
        service.update(2, testUser, 'Updated Name'),
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      await service.delete(1, testUser);

      expect(entityManager.removeAndFlush).toBeCalledTimes(1);
    });

    it('should throw an error if the category does not exist', async () => {
      await expect(service.delete(2, testUser)).rejects.toThrow();
    });
  });
});
