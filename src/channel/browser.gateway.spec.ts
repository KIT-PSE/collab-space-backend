import { Test, TestingModule } from '@nestjs/testing';
import { BrowserGateway } from './browser.gateway';
import { MikroORM } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/mysql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { ChannelService } from './channel.service';
import { Server, Socket } from 'socket.io';
import { BrowserService } from '../browser/browser.service';

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

describe('BrowserGateway', () => {
  let gateway: BrowserGateway;
  let mockServer: Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrowserGateway,
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
          provide: BrowserService,
          useValue: {
            openWebsite: jest.fn().mockResolvedValue('test-peer-id'),
            closeBrowserContext: jest.fn().mockResolvedValue(true),
            moveMouse: jest.fn(),
            mouseDown: jest.fn(),
            mouseUp: jest.fn(),
            keyDown: jest.fn(),
            keyUp: jest.fn(),
            scroll: jest.fn(),
            reload: jest.fn(),
            navigateBack: jest.fn(),
            navigateForward: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<BrowserGateway>(BrowserGateway);
    mockServer = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as unknown as Server;
    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('openWebsite', () => {
    it('should open a website in the browser', async () => {
      const result = await gateway.openWebsite(TEST_CLIENT, {
        url: 'https://google.com',
      });

      expect(result).toBe(true);
      expect(mockServer.to).toHaveBeenCalledWith(TEST_CHANNEL.id);
      expect(mockServer.to(TEST_CHANNEL.id).emit).toHaveBeenCalledWith(
        'open-website',
        'test-peer-id',
      );
    });
  });

  describe('closeBrowser', () => {
    it('should close the browser', async () => {
      const result = await gateway.closeBrowser(TEST_CLIENT);

      expect(result).toBe(true);
      expect(mockServer.to).toHaveBeenCalledWith(TEST_CHANNEL.id);
      expect(mockServer.to(TEST_CHANNEL.id).emit).toHaveBeenCalledWith(
        'close-browser',
      );
    });
  });

  describe('browserInteractions', () => {
    it('should handle a mouse move event', async () => {
      await gateway.moveMouse(TEST_CLIENT, {
        x: 10,
        y: 10,
      });
    });

    it('should handle a mouse down event', async () => {
      await gateway.mouseDown(TEST_CLIENT);
    });

    it('should handle a mouse up event', async () => {
      await gateway.mouseUp(TEST_CLIENT);
    });

    it('should handle a key down event', async () => {
      await gateway.keyDown(TEST_CLIENT, {
        key: 'a',
      });
    });

    it('should handle a key up event', async () => {
      await gateway.keyUp(TEST_CLIENT, {
        key: 'a',
      });
    });

    it('should handle a scroll event', async () => {
      await gateway.scroll(TEST_CLIENT, {
        deltaY: 10,
      });
    });

    it('should handle a reload event', async () => {
      await gateway.reload(TEST_CLIENT);
    });

    it('should handle a navigate back event', async () => {
      await gateway.navigateBack(TEST_CLIENT);
    });

    it('should handle a navigate forward event', async () => {
      await gateway.navigateForward(TEST_CLIENT);
    });
  });
});
