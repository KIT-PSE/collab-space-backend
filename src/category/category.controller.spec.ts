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

const categories = [];
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

for (let i = 0; i < 5; i++) {
  categories.push(new Category(`Category ${i}`, testUser));
  categories[i].rooms = [new Room(`Room ${i}`, categories[i])];
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
          useValue: {
            allFromUser: jest.fn().mockImplementation((user) => {
              if (user.id === 1) {
                return Promise.resolve(categories);
              }
              return Promise.resolve([]);
            }),
            create: jest
              .fn()
              .mockImplementation((name: string, owner: User) => {
                const category = new Category(name, owner);
                return Promise.resolve(category);
              }),
            update: jest
              .fn()
              .mockImplementation((id: number, owner: User, name: string) => {
                const category = categories.find((c) => c.id === id);
                if (category && category.owner === owner) {
                  category.name = name;
                  return Promise.resolve(category);
                } else {
                  throw new Error('Category not found');
                }
              }),
            delete: jest.fn(),
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
      expect(await controller.index()).toEqual(categories);
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const category = await controller.create({
        name: 'Test Category',
      });

      expect(category).toBeDefined();
      expect(category.name).toBe('Test Category');
      expect(category.owner).toBe(testUser);
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
});
