import { forwardRef, Module } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';
import { ChannelService } from './channel.service';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [forwardRef(() => RoomModule)],
  providers: [ChannelGateway, ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
