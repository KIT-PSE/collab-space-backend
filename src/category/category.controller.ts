import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategory, UpdateCategory } from './category.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';

/**
 * Controller responsible for handling category-related operations.
 * This controller is protected by an authentication guard.
 */
@Controller('category')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(
    private readonly categories: CategoryService,
    private readonly auth: AuthService,
  ) {}

  /**
   * Retrieves all categories associated with the authenticated user.
   *
   * @returns An array of categories.
   */
  @Get('/')
  public async index() {
    const user = await this.auth.user();
    return this.categories.allFromUser(user);
  }

  /**
   * Creates a new category for the authenticated user.
   *
   * @param data - The category data to be created.
   * @returns The created category.
   */
  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  public async create(@Body() data: CreateCategory) {
    const user = await this.auth.user();
    return this.categories.create(data.name, user);
  }

  /**
   * Updates an existing category for the authenticated user.
   *
   * @param id - The ID of the category to be updated.
   * @param data - The updated category data.
   * @returns The updated category.
   */
  @Put('/:id')
  public async update(@Param('id') id: number, @Body() data: UpdateCategory) {
    const user = await this.auth.user();
    return this.categories.update(id, user, data.name);
  }

  /**
   * Deletes a category for the authenticated user.
   *
   * @param id - The ID of the category to be deleted.
   * @returns A message indicating the deletion status.
   */
  @Delete('/:id')
  public async delete(@Param('id') id: number) {
    const user = await this.auth.user();
    await this.categories.delete(id, user);
    return id;
  }
}
