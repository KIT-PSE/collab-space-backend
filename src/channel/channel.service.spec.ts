import { ChannelService } from './channel.service';
import { BrowserService } from '../browser/browser.service';
import { UserService } from '../user/user.service';
import { RoomService } from '../room/room.service';
import { Test, TestingModule } from '@nestjs/testing';
import { MockRoomService } from '../room/mock/room.service.mock';
import { MockUserService } from '../user/mock/user.service.mock';
import { User } from '../user/user.entity';
import { Category } from '../category/category.entity';
import { Room } from '../room/room.entity';
import { Server, Socket } from 'socket.io';
import { Channel } from './channel';

const TEST_USER = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  organization: 'Test Organization',
  password: 'password',
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'user',
} as User;

const TEST_CATEGORY = {
  id: 1,
  name: 'Category 1',
  owner: TEST_USER,
  createdAt: new Date(),
  updatedAt: new Date(),
} as Category;

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

const TEST_CLIENT = {
  id: 'test',
  rooms: new Set(['123456']),
  broadcast: {
    to: () => ({
      emit: jest.fn(),
    }),
  },
  join: jest.fn(),
  leave: jest.fn(),
} as unknown as Socket;

const OTHER_CLIENT = {
  id: 'other-test',
  rooms: new Set(['123456']),
  broadcast: {
    to: () => ({
      emit: jest.fn(),
    }),
  },
  join: jest.fn(),
  leave: jest.fn(),
} as unknown as Socket;

const MOCK_SERVER = {
  to: jest.fn().mockReturnValue({
    emit: jest.fn(),
  }),
  emit: jest.fn(),
} as unknown as Server;

describe('ChannelService', () => {
  let service: ChannelService;
  let roomService: RoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        {
          provide: RoomService,
          useValue: new MockRoomService(TEST_CATEGORY, TEST_ROOM),
        },
        {
          provide: UserService,
          useValue: new MockUserService(TEST_USER),
        },
        {
          provide: BrowserService,
          useValue: {
            closeBrowserContext: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
    roomService = module.get<RoomService>(RoomService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('open', () => {
    it('should open a new channel', async () => {
      const channel = await service.open(
        TEST_CLIENT,
        MOCK_SERVER,
        TEST_USER.id,
        TEST_ROOM.id,
      );
      expect(channel).toBeDefined();
    });

    it('should throw an exception if the user is not found', async () => {
      await expect(
        service.open(TEST_CLIENT, MOCK_SERVER, 999, TEST_ROOM.id),
      ).rejects.toThrow('User not found');
    });

    it('should throw an exception if the room is not found', async () => {
      await expect(
        service.open(TEST_CLIENT, MOCK_SERVER, TEST_USER.id, 999),
      ).rejects.toThrow('Room not found');
    });

    it('should throw an exception if the user is not the owner', async () => {
      jest.spyOn(roomService, 'findOneWithCategory').mockResolvedValueOnce({
        ...TEST_ROOM,
        category: {
          ...TEST_CATEGORY,
          owner: {
            ...TEST_USER,
            id: 999,
          },
        },
      });
      await expect(
        service.open(TEST_CLIENT, MOCK_SERVER, TEST_USER.id, TEST_ROOM.id),
      ).rejects.toThrow('Room not found');
    });
  });

  describe('exists', () => {
    it('should return true if the channel exists', () => {
      service['channels']['123456'] = { id: '123456' } as Channel;
      expect(service.exists('123456')).toBe(true);
    });

    it('should return false if the channel does not exist', () => {
      expect(service.exists('123456')).toBe(false);
    });
  });

  describe('joinAsStudent', () => {
    it('should join a channel as a student', async () => {
      const channel = await service.open(
        TEST_CLIENT,
        MOCK_SERVER,
        TEST_USER.id,
        TEST_ROOM.id,
      );

      const channelState = await service.joinAsStudent(
        TEST_CLIENT,
        channel.id,
        'Test Student',
        TEST_ROOM.password,
      );

      expect(channelState).toBeDefined();
      expect(channelState).toHaveProperty('students');
    });

    it('should throw an error if the channel is not found', async () => {
      await expect(
        service.joinAsStudent(
          TEST_CLIENT,
          '000000',
          'Test Student',
          TEST_ROOM.password,
        ),
      ).rejects.toThrow('Channel not found');
    });

    it('should throw an error if the password is incorrect', async () => {
      const channel = await service.open(
        TEST_CLIENT,
        MOCK_SERVER,
        TEST_USER.id,
        TEST_ROOM.id,
      );

      await expect(
        service.joinAsStudent(TEST_CLIENT, channel.id, 'Test Student', 'wrong'),
      ).rejects.toThrow('Wrong password');
    });
  });

  describe('joinAsTeacher', () => {
    it('should join a channel as a teacher', async () => {
      const channel = await service.open(
        TEST_CLIENT,
        MOCK_SERVER,
        TEST_USER.id,
        TEST_ROOM.id,
      );

      const channelState = await service.joinAsTeacher(
        TEST_CLIENT,
        channel.id,
        TEST_USER.id,
      );

      expect(channelState).toBeDefined();
      expect(channelState).toHaveProperty('teacher');
    });

    it('should throw an error if the channel is not found', async () => {
      await expect(
        service.joinAsTeacher(TEST_CLIENT, '000000', TEST_USER.id),
      ).rejects.toThrow('Channel not found');
    });

    it('should throw an error if the user is not found', async () => {
      const channel = await service.open(
        TEST_CLIENT,
        MOCK_SERVER,
        TEST_USER.id,
        TEST_ROOM.id,
      );

      await expect(
        service.joinAsTeacher(TEST_CLIENT, channel.id, 999),
      ).rejects.toThrow('User not found');
    });
  });

  describe('leave', () => {
    it('should leave a channel as a student', async () => {
      const channel = await service.open(
        TEST_CLIENT,
        MOCK_SERVER,
        TEST_USER.id,
        TEST_ROOM.id,
      );

      await service.joinAsStudent(
        OTHER_CLIENT,
        channel.id,
        'Test Student',
        TEST_ROOM.password,
      );

      await service.leave(OTHER_CLIENT, channel.id);

      expect(OTHER_CLIENT.leave).toHaveBeenCalled();
    });

    it('should leave a channel as a teacher', async () => {
      const channel = await service.open(
        TEST_CLIENT,
        MOCK_SERVER,
        TEST_USER.id,
        TEST_ROOM.id,
      );

      await service.joinAsStudent(
        OTHER_CLIENT,
        channel.id,
        'Test Student',
        TEST_ROOM.password,
      );

      await service.leave(TEST_CLIENT, channel.id);

      expect(TEST_CLIENT.leave).toHaveBeenCalled();
    });

    it('should start a close timeout if the channel is empty', async () => {
      const channel = await service.open(
        TEST_CLIENT,
        MOCK_SERVER,
        TEST_USER.id,
        TEST_ROOM.id,
      );

      await service.leave(TEST_CLIENT, channel.id);

      expect(channel['closeTimeout']).toBeDefined();
      clearTimeout(channel['closeTimeout']);
    });

    it('should clear the close timeout if the channel is no longer empty', async () => {
      const channel = await service.open(
        TEST_CLIENT,
        MOCK_SERVER,
        TEST_USER.id,
        TEST_ROOM.id,
      );

      await service.leave(TEST_CLIENT, channel.id);
      expect(channel['closeTimeout']).toBeDefined();

      await service.joinAsStudent(
        OTHER_CLIENT,
        channel.id,
        'Test Student',
        TEST_ROOM.password,
      );

      expect(channel['closeTimeout']).toBeUndefined();
    });
  });

  describe('close', () => {
    it('should close a channel', async () => {
      const channel = await service.open(
        TEST_CLIENT,
        MOCK_SERVER,
        TEST_USER.id,
        TEST_ROOM.id,
      );

      await service.close(channel);

      expect(service.exists(channel.id)).toBe(false);
    });
  });

  describe('onRoomDeleted', () => {
    it('should close a channel if a room is deleted', async () => {
      const channel = await service.open(
        TEST_CLIENT,
        MOCK_SERVER,
        TEST_USER.id,
        TEST_ROOM.id,
      );

      await service.onRoomDeleted(TEST_ROOM);

      expect(service.exists(channel.id)).toBe(false);
    });
  });

  describe('fromId', () => {
    it('should return a channel if it exists', async () => {
      const channel = await service.open(
        TEST_CLIENT,
        MOCK_SERVER,
        TEST_USER.id,
        TEST_ROOM.id,
      );

      expect(service.fromId(channel.id)).toBeDefined();
    });

    it('should throw an exception if the channel does not exist', () => {
      expect(() => service.fromId('000000')).toThrow('Channel not found');
    });
  });

  describe('fromClientOrFail', () => {
    it('should return a channel if it exists', async () => {
      service['channels']['123456'] = { id: '123456' } as Channel;

      expect(service.fromClientOrFail(TEST_CLIENT)).toBeDefined();
    });
  });

  describe('getOtherClient', () => {
    it('should return the other client', async () => {
      const channel = await service.open(
        TEST_CLIENT,
        MOCK_SERVER,
        TEST_USER.id,
        TEST_ROOM.id,
      );

      await service.joinAsStudent(
        OTHER_CLIENT,
        channel.id,
        'Test Student',
        TEST_ROOM.password,
      );

      TEST_CLIENT.rooms.add(channel.id);
      OTHER_CLIENT.rooms.add(channel.id);

      const otherClient = await service.getOtherClient(
        TEST_CLIENT,
        OTHER_CLIENT.id,
      );

      expect(otherClient).toBeDefined();
    });

    it('should throw an exception if the channel does not exist', async () => {
      await expect(
        service.getOtherClient(TEST_CLIENT, OTHER_CLIENT.id),
      ).rejects.toThrow('Channel not found');
    });

    it('should throw an exception if the client is not in the channel', async () => {
      await service.open(TEST_CLIENT, MOCK_SERVER, TEST_USER.id, TEST_ROOM.id);

      await expect(
        service.getOtherClient(TEST_CLIENT, OTHER_CLIENT.id),
      ).rejects.toThrow('Channel not found');
    });
  });

  describe('getChannelFromRoom', () => {
    it('should return a channel if it exists', async () => {
      await service.open(TEST_CLIENT, MOCK_SERVER, TEST_USER.id, TEST_ROOM.id);
      expect(service.getChannelFromRoom(TEST_ROOM)).toBeDefined();
    });

    it('should return undefined if the channel does not exist', async () => {
      expect(service.getChannelFromRoom(TEST_ROOM)).toBeUndefined();
    });
  });
});
