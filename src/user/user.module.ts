/**
 * @fileOverview UserModule definition.
 */

import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './user.entity';
import { UserController } from './user.controller';

/**
 * Global module providing user-related functionality.
 */
@Global()
@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
