import { forwardRef, Global, Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Room } from './room.entity';
import { ChannelModule } from '../channel/channel.module';

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([Room]), forwardRef(() => ChannelModule)],
  providers: [RoomService],
  controllers: [RoomController],
  exports: [RoomService],
})
export class RoomModule {}
