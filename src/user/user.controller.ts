import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/guards/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { ChangePassword } from '../auth/auth.dto';
import * as bcrypt from 'bcrypt';

export type EditUser = {
  id: number;
  organization: string;
  name: string;
  email: string;
};

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

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
  @Put('changeUserData')
  public async changeUserData(@Body() data: EditUser): Promise<boolean> {
    return this.userService.changeUserData(data);
  }

  @UseGuards(AuthGuard)
  @Post('changePassword')
  public async changePassword(@Body() data: ChangePassword) {
    const user = await this.authService.user();

    const passwordValid = await bcrypt.compare(
      data.currentPassword,
      user.password,
    );

    if (!passwordValid) {
      throw new UnprocessableEntityException([
        ['currentPassword', 'Das aktuelle Passwort ist falsch'],
      ]);
    }

    await this.userService.changePassword(user, data.newPassword);

    return true;
  }
}
