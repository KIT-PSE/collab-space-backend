import { Test, TestingModule } from '@nestjs/testing';
import { ChannelGateway } from './channel.gateway';

describe('SocketGateway', () => {
  let gateway: ChannelGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelGateway],
    }).compile();

    gateway = module.get<ChannelGateway>(ChannelGateway);
  });

  /**
   * Test to check if the ChannelGateway instance is defined.
   */
  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
