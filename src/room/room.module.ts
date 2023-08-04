import { Global, Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Room } from './room.entity';

/**
 * Represents a global module for managing rooms.
 */
@Global()
@Module({
  imports: [MikroOrmModule.forFeature([Room])],
  providers: [RoomService],
  controllers: [RoomController],
  exports: [RoomService],
})
export class RoomModule {}
