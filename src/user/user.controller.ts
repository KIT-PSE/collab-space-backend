import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
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
  constructor(private readonly user: UserService) {}
  @UseGuards(AuthGuard, AdminGuard)
  @Get('findAll')
  public async findAll() {
    const users = await this.user.findAll();

    return users;
  }

  @UseGuards(AuthGuard)
  @Put('changeOrg')
  public async changeUserData(@Body() data: EditUser): Promise<boolean> {
    await this.user.changeUserData(data);
    return true;
  }
}
