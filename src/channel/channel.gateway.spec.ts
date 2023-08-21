import { User } from '../user/user.entity';
import { Room } from '../room/room.entity';
import { MockChannelService } from './mock/channel.service.mock';
import { ChannelService } from './channel.service';
import { ChannelGateway } from './channel.gateway';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { MikroORM } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/mysql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { BrowserService } from '../browser/browser.service';
import { Channel } from './channel';

const MOCK_SERVER = {
  to: jest.fn().mockReturnValue({
    emit: jest.fn(),
  }),
  emit: jest.fn(),
} as unknown as Server;

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

const TEST_ROOM = {
  id: 1,
  name: 'Test Room',
  category: {
    id: 1,
    name: 'Test Category',
    owner: TEST_USER,
  },
  password: 'room-password',
  createdAt: new Date(),
  updatedAt: new Date(),
} as Room;

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
  emit: jest.fn(),
} as unknown as Socket;

const TEST_CHANNEL = new Channel(TEST_ROOM, MOCK_SERVER, '123456');

describe('ChannelGateway', () => {
  let gateway: ChannelGateway;
  let channels: ChannelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelGateway,
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
          useValue: new MockChannelService(
            TEST_USER,
            TEST_ROOM,
            TEST_CHANNEL,
            OTHER_CLIENT,
          ),
        },
        {
          provide: BrowserService,
          useValue: {
            getPeerId: jest.fn().mockResolvedValue('test-peer-id'),
            getFromChannel: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<ChannelGateway>(ChannelGateway);
    gateway.server = MOCK_SERVER;
    channels = module.get<ChannelService>(ChannelService);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('openRoom', () => {
    it('should open a room', async () => {
      const channelState = await gateway.openRoom(TEST_CLIENT, {
        userId: TEST_USER.id,
        roomId: TEST_ROOM.id,
      });

      expect(channelState).toBeDefined();
      expect(channelState.room.name).toBe(TEST_ROOM.name);
      expect(channelState.room.channelId).toBe('123456');
      expect(channelState.teacher.user).toBe(TEST_USER);
    });
  });

  describe('joinChannelAsStudent', () => {
    it('should join a channel as a student', async () => {
      const channelState = await gateway.joinChannelAsStudent(TEST_CLIENT, {
        name: 'Test Student',
        channelId: '123456',
        password: 'room-password',
      });

      expect(channelState).toBeDefined();
      expect(channelState).toHaveProperty('students');
    });

    it('should throw an error if the channel is not found', async () => {
      const result = await gateway.joinChannelAsStudent(TEST_CLIENT, {
        name: 'Test Student',
        channelId: '654321',
        password: 'room-password',
      });

      expect(result).toHaveProperty('error');
    });

    it('should throw an error if the password is incorrect', async () => {
      const result = await gateway.joinChannelAsStudent(TEST_CLIENT, {
        name: 'Test Student',
        channelId: '123456',
        password: 'wrong-password',
      });

      expect(result).toHaveProperty('error');
    });
  });

  describe('joinChannelAsTeacher', () => {
    it('should join a channel as a teacher', async () => {
      const channelState = await gateway.joinChannelAsTeacher(TEST_CLIENT, {
        channelId: '123456',
        userId: TEST_USER.id,
      });

      expect(channelState).toBeDefined();
      expect(channelState).toMatchObject({
        teacher: {
          user: TEST_USER,
        },
      });
    });

    it('should throw an error if the channel is not found', async () => {
      const result = await gateway.joinChannelAsTeacher(TEST_CLIENT, {
        channelId: '654321',
        userId: TEST_USER.id,
      });

      expect(result).toHaveProperty('error');
    });
  });

  describe('leaveRoom', () => {
    it('should leave a room', async () => {
      await gateway.leaveRoom(TEST_CLIENT);
    });
  });

  describe('changeName', () => {
    it('should change the name of a student', async () => {
      await gateway.joinChannelAsStudent(TEST_CLIENT, {
        name: 'Test Student',
        channelId: '123456',
      });
      const result = await gateway.changeName(TEST_CLIENT, {
        name: 'New Name',
      });

      expect(result).toBeTruthy();
    });
  });

  describe('addWebcam', () => {
    it('should emit a connect-webcam event', async () => {
      const result = await gateway.addWebcam(TEST_CLIENT, {
        userId: OTHER_CLIENT.id,
        peerId: OTHER_CLIENT.id + '-peer-id',
      });

      expect(result).toBeTruthy();
      expect(OTHER_CLIENT.emit).toBeCalledWith('connect-webcam', {
        userId: TEST_CLIENT.id,
        peerId: OTHER_CLIENT.id + '-peer-id',
      });
    });
  });

  describe('updateWebcam', () => {
    it('should emit a update-webcam event', async () => {
      await gateway.joinChannelAsStudent(TEST_CLIENT, {
        name: 'Test Student',
        channelId: '123456',
      });
      const result = await gateway.updateWebcam(TEST_CLIENT, {
        video: true,
        audio: true,
      });

      expect(result).toBeTruthy();
      expect(MOCK_SERVER.to).toBeCalledWith('123456');
      expect(MOCK_SERVER.to('123456').emit).toBeCalledWith('update-webcam', {
        id: TEST_CLIENT.id,
        video: true,
        audio: true,
      });
    });
  });

  describe('updateHandSignal', () => {
    it('should emit a update-handSignal event', async () => {
      await gateway.joinChannelAsStudent(TEST_CLIENT, {
        name: 'Test Student',
        channelId: '123456',
      });
      const result = await gateway.updateHandSignal(TEST_CLIENT, {
        handSignal: true,
      });

      expect(result).toBeTruthy();
      expect(MOCK_SERVER.to).toBeCalledWith('123456');
      expect(MOCK_SERVER.to('123456').emit).toBeCalledWith(
        'update-handSignal',
        {
          id: TEST_CLIENT.id,
          handSignal: true,
        },
      );
    });
  });

  describe('updatePermission', () => {
    it('should emit a update-permission event', async () => {
      await gateway.joinChannelAsStudent(TEST_CLIENT, {
        name: 'Test Student',
        channelId: '123456',
      });
      const result = await gateway.updatePermission(TEST_CLIENT, {
        studentId: TEST_CLIENT.id,
        permission: true,
      });

      expect(result).toBeTruthy();
      expect(MOCK_SERVER.to).toBeCalledWith('123456');
      expect(MOCK_SERVER.to('123456').emit).toBeCalledWith(
        'update-permission',
        {
          id: TEST_CLIENT.id,
          permission: true,
        },
      );
    });
  });

  describe('closeChannel', () => {
    it('should close a channel', async () => {
      await gateway.closeChannel(TEST_CLIENT, {
        channelId: '123456',
      });

      expect(MOCK_SERVER.emit).toBeCalledWith('room-closed', TEST_ROOM.id);
      expect(channels.exists('123456')).toBeFalsy();
    });
  });
});
