import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../common/guards/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}
  @UseGuards(AuthGuard, AdminGuard)
  @Get('findAll')
  public async findAll() {
    const users = await this.user.findAll();

    return users;
  }
}
