import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { IsUniqueConstraint } from './common/constraints/unique';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    CategoryModule,
    RoomModule,
  ],
  providers: [AppService, IsUniqueConstraint],
})
export class AppModule {}
