import { Module } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';
import { ChannelService } from './channel.service';

@Module({
  providers: [ChannelGateway, ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
