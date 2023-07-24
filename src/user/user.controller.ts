import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../common/guards/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { UserService } from './user.service';

export type EditUser = {
  id: number;
  organization: string;
  name: string;
  email: string;
};

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

  @UseGuards(AuthGuard)
  @Put('changeOrg')
  public async changeUserData(@Body() data: EditUser): Promise<boolean> {
    return this.userService.changeUserData(data);
  }
}
