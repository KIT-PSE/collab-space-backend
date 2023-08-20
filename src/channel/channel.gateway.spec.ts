import { User } from '../user/user.entity';
import { Room } from '../room/room.entity';
import { MockChannelService } from './mock/channel.service.mock';
import { ChannelService } from './channel.service';
import { ChannelGateway } from './channel.gateway';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { MikroORM } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/mysql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { BrowserService } from '../browser/browser.service';
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
} as unknown as User;

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
} as unknown as Room;

const TEST_CLIENT = {
  id: 'test',
  broadcast: {
    to: () => ({
      emit: jest.fn(),
    }),
  },
  join: jest.fn(),
} as unknown as Socket;

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
            new Channel(TEST_ROOM, null, '123456'),
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
    });
  });
});
