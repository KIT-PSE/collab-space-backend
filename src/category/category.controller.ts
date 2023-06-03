import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategory, UpdateCategory } from './category.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('category')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(private readonly categories: CategoryService) {}

  @Get('/')
  public async index() {
    return this.categories.allFromUser();
  }

  @Post('/')
  public async create(@Body() data: CreateCategory) {
    return this.categories.create(data.name);
  }

  @Put('/:id')
  public async update(@Param('id') id: number, @Body() data: UpdateCategory) {
    return this.categories.update(id, data.name);
  }

  @Delete('/:id')
  public async delete(@Param('id') id: number) {
    return this.categories.delete(id);
  }
}
