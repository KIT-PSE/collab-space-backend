import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../common/guards/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(AuthGuard, AdminGuard)
  @Get('findAll')
  public async findAll() {
    return await this.userService.findAll();
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post('changeRole')
  public async changeRole(@Body() data: { id: number }) {
    return await this.userService.changeRole(data.id);
  }
}
