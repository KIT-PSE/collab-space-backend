import { Module } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';
import { ChannelService } from './channel.service';
import { BrowserGateway } from './browser.gateway';

@Module({
  providers: [ChannelGateway, BrowserGateway, ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
