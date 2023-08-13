import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { JwtService } from '@nestjs/jwt';
import { CategoryService } from './category.service';
import { AuthService } from '../auth/auth.service';
import { isGuarded } from '../../test/utils';
import { AuthGuard } from '../auth/auth.guard';
import { Category } from './category.entity';
import { Room } from '../room/room.entity';
import { User } from '../user/user.entity';
import { MockCategoryService } from './mock/category.service.mock';

const CATEGORIES = [];
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

for (let i = 0; i < 5; i++) {
  CATEGORIES.push(new Category(`Category ${i}`, TEST_USER));
  CATEGORIES[i].id = i + 1;
  CATEGORIES[i].rooms = [new Room(`Room ${i}`, CATEGORIES[i])];
}

describe('CategoryController', () => {
  let controller: CategoryController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: new MockCategoryService(CATEGORIES),
        },
        {
          provide: AuthService,
          useValue: {
            user: jest.fn().mockResolvedValue(TEST_USER),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    authService = module.get<AuthService>(AuthService);
  });

  /**
   * Test case to ensure that the CategoryController is defined.
   * It checks whether the controller instance is created successfully.
   */
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be protected by AuthGuard', () => {
    expect(isGuarded(CategoryController, AuthGuard)).toBe(true);
  });

  describe('index', () => {
    it('should return all categories of the current user', async () => {
      expect(await controller.index()).toEqual(CATEGORIES);
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const category = await controller.create({
        name: 'Test Category',
      });

      expect(category).toBeDefined();
      expect(category.name).toBe('Test Category');
      expect(category.owner).toBe(TEST_USER);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const category = await controller.update(1, {
        name: 'Updated Category',
      });

      expect(category).toBeDefined();
      expect(category.name).toBe('Updated Category');
    });

    it('should throw an error if the id does not exist', async () => {
      await expect(
        controller.update(6, {
          name: 'Updated Category',
        }),
      ).rejects.toThrow();
    });

    it('should throw an error if the category does not belong to the user', async () => {
      jest.spyOn(authService, 'user').mockResolvedValueOnce({
        id: 2,
        name: 'Test User 2',
        email: 'test2@example.com',
      } as unknown as User);

      await expect(
        controller.update(1, {
          name: 'Updated Category',
        }),
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      await controller.delete(1);

      expect(CATEGORIES.length).toBe(4);
    });

    it('should throw an error if the id does not exist', async () => {
      await expect(controller.delete(6)).rejects.toThrow();
    });

    it('should throw an error if the category does not belong to the user', async () => {
      jest.spyOn(authService, 'user').mockResolvedValueOnce({
        id: 2,
        name: 'Test User 2',
        email: 'test2@example.com',
      } as unknown as User);

      await expect(controller.delete(1)).rejects.toThrow();
    });
  });
});
