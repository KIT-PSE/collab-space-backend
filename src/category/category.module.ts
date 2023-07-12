import { Global, Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Category } from './category.entity';

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([Category])],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
