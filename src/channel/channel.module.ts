import { Module } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';
import { ChannelService } from './channel.service';
import { NotesGateway } from './notes.gateway';

@Module({
  providers: [ChannelGateway, NotesGateway, ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
