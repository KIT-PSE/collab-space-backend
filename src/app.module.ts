import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { RoomController } from './room/room.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [MikroOrmModule.forRoot(), AuthModule, UserModule],
  controllers: [RoomController],
  providers: [AppService],
})
export class AppModule {}
