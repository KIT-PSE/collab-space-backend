import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';
import { AuthGuard } from '../auth/auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get('findAll')
  public async findAll() {
    const users = await this.user.findAll();

    return users;
  }
}
