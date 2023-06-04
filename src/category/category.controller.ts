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
import { AuthService } from '../auth/auth.service';

@Controller('category')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(
    private readonly categories: CategoryService,
    private readonly auth: AuthService,
  ) {}

  @Get('/')
  public async index() {
    const user = await this.auth.user();
    return this.categories.allFromUser(user);
  }

  @Post('/')
  public async create(@Body() data: CreateCategory) {
    const user = await this.auth.user();
    return this.categories.create(data.name, user);
  }

  @Put('/:id')
  public async update(@Param('id') id: number, @Body() data: UpdateCategory) {
    const user = await this.auth.user();
    return this.categories.update(id, user, data.name);
  }

  @Delete('/:id')
  public async delete(@Param('id') id: number) {
    const user = await this.auth.user();
    return this.categories.delete(id, user);
  }
}
