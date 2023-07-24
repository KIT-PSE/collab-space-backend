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

@Controller('category/:category/room')
export class RoomController {
  constructor(
    private readonly rooms: RoomService,
    private readonly categories: CategoryService,
    private readonly auth: AuthService,
  ) {}

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
}
