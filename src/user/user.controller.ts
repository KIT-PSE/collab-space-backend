import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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

/**
 * Interface representing user data for editing.
 */
export type EditUser = {
  id: number;
  organization: string;
  name: string;
  email: string;
};

/**
 * Controller managing user-related routes and operations.
 */
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Retrieve a list of all users.
   * Requires authentication and admin privilege.
   */
  @UseGuards(AuthGuard, AdminGuard)
  @Get('findAll')
  public async findAll() {
    return await this.userService.findAll();
  }

  /**
   * Change the role of a user.
   * Requires authentication and admin privilege.
   * @param data - Object containing the ID of the user.
   */
  @UseGuards(AuthGuard, AdminGuard)
  @Post('changeRole')
  public async changeRole(@Body() data: { id: number }) {
    return await this.userService.changeRole(data.id);
  }

  /**
   * Delete a user by ID.
   * Requires authentication and admin privilege.
   * @param userId - ID of the user to delete.
   */
  @UseGuards(AuthGuard, AdminGuard)
  @Delete('/:userId')
  public async delete(@Param('userId') userId: number) {
    await this.userService.delete(userId);

    return { message: 'success' };
  }

  /**
   * Change user password.
   * Requires authentication.
   * @param data - Object containing current and new passwords.
   */
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
