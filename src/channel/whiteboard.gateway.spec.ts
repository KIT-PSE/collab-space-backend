import { Test, TestingModule } from '@nestjs/testing';
import { WhiteboardGateway } from './whiteboard.gateway';
import { ChannelService } from './channel.service';
import { Socket } from 'socket.io';

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

describe('WhiteboardGateway', () => {
  let gateway: WhiteboardGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhiteboardGateway,
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
      ],
    }).compile();

    gateway = module.get<WhiteboardGateway>(WhiteboardGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('whiteboardChange', () => {
    it('should update the canvas JSON in the channel data', async () => {
      await gateway.whiteboardChange(TEST_CLIENT, {
        canvas: '{"test": true}',
      });

      expect(TEST_CHANNEL.canvasJSON).toBe('{"test": true}');
    });
  });
});
