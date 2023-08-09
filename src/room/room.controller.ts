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
import { AuthGuard } from '../auth/auth.guard';
import { CreateRoom, UpdateRoom } from './room.dto';
import { RoomService } from './room.service';
import { AuthService } from '../auth/auth.service';
import { CategoryService } from '../category/category.service';

/**
 * Controller responsible for handling room-related endpoints.
 */
@Controller('category/:category/room')
export class RoomController {
  constructor(
    private readonly rooms: RoomService,
    private readonly categories: CategoryService,
    private readonly auth: AuthService,
  ) {}

  /**
   * Create a new room within a category.
   *
   * @param categoryId - The ID of the category.
   * @param data - The data for creating a room.
   * @returns The created room.
   */
  @Post('/')
  @UseGuards(AuthGuard)
  public async create(
    @Param('category') categoryId: number,
    @Body() data: CreateRoom,
  ) {
    const user = await this.auth.user();
    const category = await this.categories.get(categoryId, user);
    return this.rooms.create(data.name, category, data.password);
  }

  /**
   * Update an existing room within a category.
   *
   * @param categoryId - The ID of the category.
   * @param roomId - The ID of the room to be updated.
   * @param data - The updated room data.
   * @returns The updated room.
   */
  @Put('/:room')
  @UseGuards(AuthGuard)
  public async update(
    @Param('category') categoryId: number,
    @Param('room') roomId: number,
    @Body() data: UpdateRoom,
  ) {
    const user = await this.auth.user();
    const category = await this.categories.get(categoryId, user);
    return this.rooms.update(roomId, category, data.name);
  }

  /**
   * Delete a room within a category.
   *
   * @param categoryId - The ID of the category.
   * @param roomId - The ID of the room to be deleted.
   * @returns A boolean indicating if the deletion was successful.
   */
  @Delete('/:room')
  @UseGuards(AuthGuard)
  public async delete(
    @Param('category') categoryId: number,
    @Param('room') roomId: number,
  ) {
    const user = await this.auth.user();
    const category = await this.categories.get(categoryId, user);
    return this.rooms.delete(roomId, category);
  }

  /**
   * Get notes associated with a room.
   *
   * @param categoryId - The ID of the category.
   * @param roomId - The ID of the room.
   * @returns Notes associated with the specified room.
   */
  @Get('/:room/notes')
  public async getNotes(
    @Param('category') categoryId: number,
    @Param('room') roomId: number,
  ) {
    const user = await this.auth.user();
    await this.categories.get(categoryId, user);
    return this.rooms.getNotes(roomId);
  }
}
