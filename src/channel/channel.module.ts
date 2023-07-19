import { Module } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';
import { ChannelService } from './channel.service';
import { WhiteboardGateway } from './whiteboard.gateway';

@Module({
  providers: [ChannelGateway, WhiteboardGateway, ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
