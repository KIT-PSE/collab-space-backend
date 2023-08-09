import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { EntityManager } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Room } from './room.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Category } from '../category/category.entity';
import { EntityRepository } from '@mikro-orm/mysql';

const testCategory = {
  id: 1,
  name: 'Category 1',
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
  notes: [],
} as unknown as Room;

/**
 * Test suite for the `RoomService` class.
 */
describe('RoomService', () => {
  let service: RoomService;
  let entityManager: EntityManager;
  let repository: EntityRepository<Room>;
  let eventEmitter: EventEmitter2;

  /**
   * Initialize the testing module and get an instance of `RoomService`.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: EntityManager,
          useValue: {
            persistAndFlush: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getRepositoryToken(Room),
          useValue: {
            findOneOrFail: jest
              .fn()
              .mockImplementation(
                ({ id, category }: { id: number; category: Category }) => {
                  if (
                    (id === 1 && category === undefined) ||
                    (id === 1 && category === testRoom.category)
                  ) {
                    return Promise.resolve(testRoom);
                  } else {
                    throw new Error('Room not found');
                  }
                },
              ),
            findOne: jest.fn().mockImplementation(({ id }: { id: number }) => {
              if (id === 1) {
                return Promise.resolve(testRoom);
              } else {
                return Promise.resolve(null);
              }
            }),
            nativeDelete: jest
              .fn()
              .mockImplementation(({ id }: { id: number }) => {
                if (id === 1) {
                  return Promise.resolve(testRoom);
                } else {
                  throw new Error('Room not found');
                }
              }),
          },
        },
        EventEmitter2,
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    entityManager = module.get<EntityManager>(EntityManager);
    repository = module.get<EntityRepository<Room>>(getRepositoryToken(Room));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  /**
   * Test case to ensure that the `RoomService` instance is defined.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return the room if it exists and matches the category', async () => {
      const result = await service.get(1, testCategory);
      expect(result).toEqual(testRoom);
    });

    it('should throw an error if the room does not exist or does not match the category', async () => {
      const category = new Category('Category 2', undefined);
      category.id = 2;

      await expect(service.get(1, category)).rejects.toThrow('Room not found');
      await expect(service.get(2, category)).rejects.toThrow('Room not found');
    });
  });

  describe('findOneWithCategory', () => {
    it('should return the room with its associated category if found', async () => {
      const result = await service.findOneWithCategory(1);

      expect(result).toEqual(testRoom);
      expect(repository.findOne).toHaveBeenCalledWith(
        { id: 1 },
        { populate: ['category'] },
      );
    });

    it('should return null if the room is not found', async () => {
      const result = await service.findOneWithCategory(2);

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith(
        { id: 2 },
        { populate: ['category'] },
      );
    });
  });

  describe('create', () => {
    it('should persist and return the created room', async () => {
      const result = await service.create('Room 1', testCategory, 'password');

      expect(result).toEqual(
        expect.objectContaining({
          name: 'Room 1',
          category: testCategory,
          password: 'password',
        }),
      );
      expect(entityManager.persistAndFlush).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Room 1',
          category: testCategory,
          password: 'password',
        }),
      );
    });
  });

  describe('update', () => {
    it('should successfully update the room name and return the updated room', async () => {
      const updatedName = 'Updated Room';
      const result = await service.update(1, testCategory, updatedName);

      expect(result).toEqual(testRoom);
      expect(testRoom.name).toBe(updatedName);
      expect(entityManager.persistAndFlush).toHaveBeenCalledWith(testRoom);
    });

    it('should throw an error if the room does not exist or does not match the category', async () => {
      const differentCategory = {
        id: 2,
        name: 'Category 2',
      } as unknown as Category;

      const updatedName = 'Updated Room';

      // Case: Room doesn't match the provided category
      await expect(
        service.update(1, differentCategory, updatedName),
      ).rejects.toThrow('Room not found');

      // Case: Room doesn't exist
      await expect(
        service.update(2, testCategory, updatedName),
      ).rejects.toThrow('Room not found');
    });
  });

  describe('delete', () => {
    let eventEmitterEmitSpy: jest.SpyInstance;

    beforeEach(() => {
      eventEmitterEmitSpy = jest.spyOn(eventEmitter, 'emit');
    });

    it('should delete the room if it exists and matches the category', async () => {
      await service.delete(1, testCategory);

      expect(repository.nativeDelete).toHaveBeenCalledWith({ id: 1 });
      expect(eventEmitterEmitSpy).toHaveBeenCalledWith(
        'room.deleted',
        testRoom,
      );
    });

    it('should throw an error if the room does not exist or does not match the category', async () => {
      const differentCategory = {
        id: 2,
        name: 'Category 2',
      } as unknown as Category;

      await expect(service.delete(1, differentCategory)).rejects.toThrow(
        'Room not found',
      );
      await expect(service.delete(2, testCategory)).rejects.toThrow(
        'Room not found',
      );

      expect(eventEmitterEmitSpy).not.toHaveBeenCalledWith(
        'room.deleted',
        expect.anything(),
      );
    });
  });

  describe('getNotes', () => {
    it('should return the notes associated with a room', async () => {
      const testNotes = [
        { id: 1, content: 'Note 1' },
        { id: 2, content: 'Note 2' },
      ];
      testRoom.notes.loadItems = jest.fn().mockResolvedValueOnce(testNotes);

      const result = await service.getNotes(1);

      expect(result).toEqual(testNotes);
      expect(repository.findOneOrFail).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw an error if the room is not found', async () => {
      await expect(service.getNotes(2)).rejects.toThrow('Room not found');
    });
  });

  describe('updateWhiteboard', () => {
    const canvasData = 'testCanvasData';

    it('should update the whiteboard canvas of a room and return the updated room', async () => {
      const result = await service.updateWhiteboard(1, canvasData);

      expect(result).toEqual(testRoom);
      expect(testRoom.whiteboardCanvas).toEqual(canvasData);
      expect(entityManager.persistAndFlush).toHaveBeenCalledWith(testRoom);
    });

    it('should throw an error if the room is not found', async () => {
      await expect(service.updateWhiteboard(2, canvasData)).rejects.toThrow(
        'Room not found',
      );
    });
  });
});
