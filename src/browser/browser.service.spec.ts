import { Test, TestingModule } from '@nestjs/testing';
import { BrowserService } from './browser.service';
import { Server } from 'socket.io';
import { Channel } from '../channel/channel';

describe('BrowserService', () => {
  let service: BrowserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [BrowserService],
    }).compile();

    service = module.get<BrowserService>(BrowserService);
  });

  afterEach(async () => {
    await service.close();
  });

  /**
   * Single test case: Verifies if the BrowserService is defined.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('openWebsite', () => {
    it('should create a browser context for a new channelId', async () => {
      const channelId = 'test-channel-id';
      const url = 'https://example.com';
      const server = {
        to: () => {
          return {
            emit: jest.fn(),
          };
        },
      } as unknown as Server;

      const peerId = await service.openWebsite(channelId, url, server);
      expect(peerId).toBeDefined();
      expect(service.getPeerId(channelId)).toEqual(peerId);
    });
  });

  describe('browserInteraction', () => {
    it('should execute the browser interaction functions', async () => {
      const channelId = 'test-channel-id';
      const url = 'https://example.com';
      const server = {
        to: () => {
          return {
            emit: jest.fn(),
          };
        },
      } as unknown as Server;

      const peerId = await service.openWebsite(channelId, url, server);
      expect(peerId).toBeDefined();

      await service.moveMouse(channelId, 0, 0);
      await service.mouseDown(channelId);
      await service.mouseUp(channelId);
      await service.keyDown(channelId, 'a');
      await service.keyUp(channelId, 'a');
      await service.scroll(channelId, 0);
      await service.navigateForward(channelId);
      await service.closeBrowserContext(channelId);
      expect(service.getPeerId(channelId)).toBeUndefined();
    });
  });

  describe('getFromChannel', () => {
    it('should return the browser context associated with a channel', async () => {
      const channelId = 'test-channel-id';
      const url = 'https://example.com';
      const server = {
        to: () => {
          return {
            emit: jest.fn(),
          };
        },
      } as unknown as Server;

      const peerId = await service.openWebsite(channelId, url, server);
      expect(peerId).toBeDefined();

      const channel = {
        id: channelId,
      } as Channel;

      const browser = service.getFromChannel(channel);
      expect(browser).toBeDefined();
    });
  });

  describe('closeBrowserContext', () => {
    it('should close the browser context associated with a channel', async () => {
      const channelId = 'test-channel-id';
      const url = 'https://example.com';
      const server = {
        to: () => {
          return {
            emit: jest.fn(),
          };
        },
      } as unknown as Server;

      const peerId = await service.openWebsite(channelId, url, server);
      expect(peerId).toBeDefined();

      const channel = {
        id: channelId,
      } as Channel;

      const browser = service.getFromChannel(channel);
      expect(browser).toBeDefined();
      await service.closeBrowserContext(channelId);
      const browser2 = service.getFromChannel(channel);
      expect(browser2).toBeNull();
    });
  });
});
