import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { CategoryService } from '../category/category.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { Category } from '../category/category.entity';
import { Room } from './room.entity';
import { AuthGuard } from '../auth/auth.guard';
import { isGuarded } from '../../test/utils';

const testUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  organization: 'Test Organization',
  password: 'password',
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'user',
} as unknown as User;

const testCategory = {
  id: 1,
  name: 'Category 1',
  owner: testUser,
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as Category;

const testRoom = {
  id: 1,
  name: 'Room 1',
  password: 'password',
  category: testCategory,
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
          useValue: {
            create: jest.fn().mockImplementation((name, category, password) => {
              return Promise.resolve({
                ...testRoom,
                name,
                category,
                password,
              });
            }),
            update: jest
              .fn()
              .mockImplementation(
                (id: number, category: Category, name: string) => {
                  if (id === 1 && category === testCategory) {
                    return Promise.resolve({
                      ...testRoom,
                      name,
                    });
                  }
                  throw new Error('Room not found');
                },
              ),
            delete: jest
              .fn()
              .mockImplementation((id: number, category: Category) => {
                if (id === 1 && category === testCategory) {
                  return Promise.resolve(1);
                }
                throw new Error('Room not found');
              }),
            getNotes: jest.fn().mockImplementation((id: number) => {
              if (id === 1) {
                return Promise.resolve(testRoom.notes);
              }
              throw new Error('Room not found');
            }),
          },
        },
        {
          provide: CategoryService,
          useValue: {
            get: jest.fn().mockImplementation((id: number, owner: User) => {
              if (id === 1 && owner === testUser) {
                return Promise.resolve(testCategory);
              }
              throw new Error('Category not found');
            }),
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
      const result = await controller.create(testCategory.id, createRoomDto);

      expect(result).toEqual(
        expect.objectContaining({
          name: createRoomDto.name,
          password: createRoomDto.password,
          category: testCategory,
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
        testRoom.id,
        testCategory.id,
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
        controller.update(testCategory.id, 2, updateRoomDto),
      ).rejects.toThrow('Room not found');
    });

    it('should throw an error if category is not found', async () => {
      await expect(
        controller.update(2, testRoom.id, updateRoomDto),
      ).rejects.toThrow('Category not found');
    });

    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.update, AuthGuard)).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete the room', async () => {
      const result = await controller.delete(testRoom.id, testCategory.id);

      expect(result).toEqual(1);
    });

    it('should throw an error if room is not found', async () => {
      await expect(controller.delete(testCategory.id, 2)).rejects.toThrow(
        'Room not found',
      );
    });

    it('should throw an error if category is not found', async () => {
      await expect(controller.delete(2, testRoom.id)).rejects.toThrow(
        'Category not found',
      );
    });

    it('should be protected with AuthGuard', () => {
      expect(isGuarded(controller.delete, AuthGuard)).toBe(true);
    });
  });

  describe('getNotes', () => {
    it('should return the notes of the room', async () => {
      const result = await controller.getNotes(testRoom.id, testCategory.id);

      expect(result).toEqual(testRoom.notes);
    });

    it('should throw an error if room is not found', async () => {
      await expect(controller.getNotes(testCategory.id, 2)).rejects.toThrow(
        'Room not found',
      );
    });

    /**
     * Aktuell wird hier noch nicht gecheckt, ob die Kategorie auch wirklich
     * zu dem Raum gehört. Das Problem ist, dass diese Methode auch von
     * nicht eingeloggten Usern aufgerufen werden kann. Hier muss man evtl.
     * eine Schnittstelle in dem CategoryService einbauen, die keinen User
     * benötigt.
     */
    it('should throw an error if category is not found', async () => {
      await expect(controller.getNotes(2, testRoom.id)).rejects.toThrow(
        'Category not found',
      );
    });
  });
});
