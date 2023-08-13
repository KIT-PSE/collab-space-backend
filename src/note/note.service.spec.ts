import { NoteService } from './note.service';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Note } from './note.entity';
import { Room } from '../room/room.entity';
import { Category } from '../category/category.entity';
import { MockNoteRepository } from './mock/note.repository.mock';

/**
 * Test suite for the 'NoteService' class.
 */
describe('NoteService', () => {
  let service: NoteService;
  let entityManager: EntityManager;

  /**
   * Initialize the testing module and get an instance of `NoteService`.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoteService,
        {
          provide: EntityManager,
          useValue: {
            persistAndFlush: jest.fn(),
            removeAndFlush: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Note),
          useValue: new MockNoteRepository(),
        },
      ],
    }).compile();

    service = module.get<NoteService>(NoteService);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  /**
   * Test case to ensure that the `NoteService` instance is defined.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addNote', () => {
    let room: Room;

    beforeEach(() => {
      room = new Room('Test Room', new Category('Test Category', undefined));
    });

    it('should create a new note and add it to the given room', async () => {
      const noteName = 'New Test Note';
      const createdNote = await service.addNote(room, noteName);

      expect(createdNote.name).toBe(noteName);
      expect(createdNote.room).toBe(room);
      expect(entityManager.persistAndFlush).toHaveBeenCalledWith(createdNote);
    });
  });

  describe('updateNote', () => {
    it('should update note content correctly', async () => {
      const updatedContent = 'Updated Test Note Content';

      const updatedNote = await service.updateNote(1, updatedContent);

      expect(updatedNote.content).toBe(updatedContent);
      expect(entityManager.persistAndFlush).toHaveBeenCalledWith(updatedNote);
    });

    it('should throw an error if note does not exist', async () => {
      await expect(service.updateNote(2, 'Some content')).rejects.toThrow(
        'Note not found',
      );

      expect(entityManager.persistAndFlush).not.toHaveBeenCalled();
    });
  });

  describe('deleteNoteById', () => {
    it('should delete a note successfully when note with given ID exists', async () => {
      const result = await service.deleteNoteById(1);

      expect(result).toBe(true);
      expect(entityManager.removeAndFlush).toHaveBeenCalled();
    });

    it('should throw an error when note with given ID does not exist', async () => {
      await expect(service.deleteNoteById(2)).rejects.toThrow('Note not found');

      expect(entityManager.removeAndFlush).not.toHaveBeenCalled();
    });
  });
});
