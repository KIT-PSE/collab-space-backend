import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { IsUniqueConstraint } from './common/constraints/unique';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { RoomModule } from './room/room.module';
import { ExistsConstraint } from './common/constraints/exists';
import { ChannelModule } from './channel/channel.module';
import { BrowserModule } from './browser/browser.module';

/**
 * Main application module where other modules are imported and configured.
 */
@Module({
  imports: [
    MikroOrmModule.forRoot(),
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    CategoryModule,
    RoomModule,
    ChannelModule,
    BrowserModule,
  ],
  providers: [IsUniqueConstraint, ExistsConstraint],
})
export class AppModule {}
