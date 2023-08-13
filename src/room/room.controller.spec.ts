import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { CategoryService } from '../category/category.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { isGuarded } from '../../test/utils';
import { MockRoomService } from './mock/room.service.mock';
import { MockAuthService } from '../auth/mock/auth.service.mock';
import { MockCategoryService } from '../category/mock/category.service.mock';
import { User } from '../user/user.entity';
import { Category } from '../category/category.entity';
import { Room } from './room.entity';

const TEST_USER = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  organization: 'Test Organization',
  password: 'password',
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'user',
} as unknown as User;

const TEST_CATEGORY = {
  id: 1,
  name: 'Category 1',
  owner: TEST_USER,
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as Category;

const TEST_ROOM = {
  id: 1,
  name: 'Room 1',
  password: 'password',
  category: TEST_CATEGORY,
  createdAt: new Date(),
  updatedAt: new Date(),
  notes: [
    {
      id: 1,
      title: 'Note 1',
      content: 'Note 1 content',
    },
    {
      id: 2,
      title: 'Note 2',
      content: 'Note 2 content',
    },
  ],
} as unknown as Room;

/**
 * Test suite for the RoomController class.
 */
describe('RoomController', () => {
  let controller: RoomController;

  /**
   * Before each test, create a testing module with RoomController as the controller.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [
        {
          provide: RoomService,
          useValue: new MockRoomService(TEST_CATEGORY, TEST_ROOM),
        },
        {
          provide: CategoryService,
          useValue: new MockCategoryService([TEST_CATEGORY]),
        },
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

    controller = module.get<RoomController>(RoomController);
  });

  /**
   * Test if the controller is defined.
   */
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createRoomDto = {
      name: 'Test Room',
      password: 'password',
    };

    it('should create the room and return the created room', async () => {
      const result = await controller.create(TEST_CATEGORY.id, createRoomDto);

      expect(result).toEqual(
        expect.objectContaining({
          name: createRoomDto.name,
          password: createRoomDto.password,
          category: TEST_CATEGORY,
        }),
      );
    });

    it('should throw an error if category is not found', async () => {
      await expect(controller.create(2, createRoomDto)).rejects.toThrow(
        'Category not found',
      );
    });

    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.create, AuthGuard)).toBe(true);
    });
  });

  describe('update', () => {
    const updateRoomDto = {
      name: 'Updated Room',
    };

    it('should update the room and return the updated room', async () => {
      const result = await controller.update(
        TEST_ROOM.id,
        TEST_CATEGORY.id,
        updateRoomDto,
      );

      expect(result).toEqual(
        expect.objectContaining({
          name: updateRoomDto.name,
        }),
      );
    });

    it('should throw an error if room is not found', async () => {
      await expect(
        controller.update(TEST_CATEGORY.id, 2, updateRoomDto),
      ).rejects.toThrow('Room not found');
    });

    it('should throw an error if category is not found', async () => {
      await expect(
        controller.update(2, TEST_ROOM.id, updateRoomDto),
      ).rejects.toThrow('Category not found');
    });

    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.update, AuthGuard)).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete the room', async () => {
      const result = await controller.delete(TEST_ROOM.id, TEST_CATEGORY.id);

      expect(result).toEqual(1);
    });

    it('should throw an error if room is not found', async () => {
      await expect(controller.delete(TEST_CATEGORY.id, 2)).rejects.toThrow(
        'Room not found',
      );
    });

    it('should throw an error if category is not found', async () => {
      await expect(controller.delete(2, TEST_ROOM.id)).rejects.toThrow(
        'Category not found',
      );
    });

    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.delete, AuthGuard)).toBe(true);
    });
  });

  describe('getNotes', () => {
    it('should return the notes of the room', async () => {
      const result = await controller.getNotes(TEST_ROOM.id, TEST_CATEGORY.id);

      expect(result).toEqual(TEST_ROOM.notes);
    });

    it('should throw an error if room is not found', async () => {
      await expect(controller.getNotes(TEST_CATEGORY.id, 2)).rejects.toThrow(
        'Room not found',
      );
    });
  });
});
