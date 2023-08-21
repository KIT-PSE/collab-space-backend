import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Category } from './category.entity';
import { EntityManager } from '@mikro-orm/core';
import { ChannelService } from '../channel/channel.service';
import { User } from '../user/user.entity';
import { Room } from '../room/room.entity';
import { MockCategoryRepository } from './mock/category.repository.mock';
import { Channel } from '../channel/channel';

const CATEGORIES = [];
for (let i = 0; i < 5; i++) {
  CATEGORIES.push(new Category(`Category ${i}`, undefined));
  CATEGORIES[i].rooms = [new Room(`Room ${i}`, CATEGORIES[i])];
}
const TEST_USER = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  organization: 'Test Organization',
  categories: {
    loadItems: jest.fn().mockResolvedValue(CATEGORIES),
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
          useValue: new MockCategoryRepository(TEST_USER),
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
      const categories = await service.allFromUser(TEST_USER);

      expect(TEST_USER.categories.loadItems).toBeCalledWith({
        populate: ['rooms'],
      });
      expect(channels.getChannelFromRoom).toHaveBeenCalledTimes(5);
      expect(categories).toHaveLength(5);
    });

    it('should populate the channelId for a room', async () => {
      jest.spyOn(channels, 'getChannelFromRoom').mockReturnValueOnce({
        id: 1,
      } as unknown as Channel);
      const categories = await service.allFromUser(TEST_USER);

      expect(categories[0].rooms[0].channelId).toBe(1);
    });
  });

  describe('get', () => {
    it('should return a category', async () => {
      const category = await service.get(1, TEST_USER);

      expect(category).toBeDefined();
      expect(category.id).toBe(1);
    });

    it('should throw an error if the category does not exist', async () => {
      await expect(service.get(2, TEST_USER)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      const category = await service.create('Test Category', TEST_USER);

      expect(category).toBeDefined();
      expect(category.name).toBe('Test Category');
      expect(category.owner).toBe(TEST_USER);
      expect(entityManager.persistAndFlush).toBeCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const category = await service.update(1, TEST_USER, 'Updated Name');

      expect(category).toBeDefined();
      expect(category.name).toBe('Updated Name');
      expect(entityManager.persistAndFlush).toBeCalledTimes(1);
    });

    it('should throw an error if the category does not exist', async () => {
      await expect(
        service.update(2, TEST_USER, 'Updated Name'),
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      await service.delete(1, TEST_USER);

      expect(entityManager.removeAndFlush).toBeCalledTimes(1);
    });

    it('should throw an error if the category does not exist', async () => {
      await expect(service.delete(2, TEST_USER)).rejects.toThrow();
    });
  });
});
