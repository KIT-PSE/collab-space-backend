import { Global, Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Category } from './category.entity';
import { ChannelModule } from '../channel/channel.module';

/**
 * Global module for handling category-related functionality.
 * Provides services, controllers, and exports related to categories.
 */
@Global()
@Module({
  imports: [MikroOrmModule.forFeature([Category]), ChannelModule],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
