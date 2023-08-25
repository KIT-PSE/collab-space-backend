import { Server, Socket } from 'socket.io';
import { Test, TestingModule } from '@nestjs/testing';
import { NotesGateway } from './notes.gateway';
import { NoteService } from '../note/note.service';
import { ChannelService } from './channel.service';
import { MikroORM } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/mysql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const TEST_CHANNEL = {
  id: 'test',
  canvasJSON: '',
};

const TEST_CLIENT = {
  id: 'test',
  broadcast: {
    to: () => ({
      emit: jest.fn(),
    }),
  },
} as unknown as Socket;

describe('NotesGateway', () => {
  let gateway: NotesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesGateway,
        {
          provide: MikroORM,
          useValue: MikroORM.init(
            defineConfig({
              connect: false,
              clientUrl: 'test',
              schema: 'test',
              entities: ['dist/**/*.entity.js'],
              entitiesTs: ['src/**/*.entity.ts'],
              metadataProvider: TsMorphMetadataProvider,
            }),
          ),
        },
        {
          provide: ChannelService,
          useValue: {
            fromClientOrFail: jest.fn().mockImplementation((client: Socket) => {
              if (client.id === TEST_CLIENT.id) {
                return Promise.resolve(TEST_CHANNEL);
              } else {
                return Promise.reject();
              }
            }),
          },
        },
        {
          provide: NoteService,
          useValue: {
            addNote: jest.fn().mockResolvedValue({
              id: 1,
              name: 'Test Note',
              content: '',
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
            updateNote: jest.fn(),
            deleteNoteById: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<NotesGateway>(NotesGateway);
    const mockServer = {
      to: () => ({
        emit: jest.fn(),
      }),
    } as unknown as Server;
    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('addNote', () => {
    it('should add a new note', async () => {
      const note = await gateway.addNote(TEST_CLIENT, { name: 'Test Note' });

      expect(note).toBeDefined();
      expect(note.name).toBe('Test Note');
    });
  });

  describe('updateNote', () => {
    it('should update an existing note', async () => {
      const note = await gateway.updateNote(TEST_CLIENT, {
        noteId: 1,
        content: 'Test Content',
      });

      expect(note).toBe(true);
    });
  });

  describe('deleteNote', () => {
    it('should delete a note', async () => {
      const result = await gateway.deleteNote(TEST_CLIENT, {
        noteId: 1,
      });

      expect(result).toBe(true);
    });
  });
});
