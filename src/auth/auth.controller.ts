import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Delete,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Response } from 'express';
import { RegisterUser, LoginUser } from './auth.dto';

/**
 * Controller handling authentication-related operations.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /**
   * Registers a new user.
   *
   * @param data - Registration data for the new user.
   * @param response - Express response object to set cookies.
   * @returns The registration payload.
   */
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  public async register(
    @Body() data: RegisterUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = await this.auth.register(data);

    response.cookie('jwt', payload.token, { httpOnly: true });

    return payload;
  }

  /**
   * Logs in a user.
   *
   * @param data - Login credentials of the user.
   * @param response - Express response object to set cookies.
   * @returns The login payload.
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  public async login(
    @Body() data: LoginUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = await this.auth.login(data);

    response.cookie('jwt', payload.token, { httpOnly: true });

    return payload;
  }

  /**
   * Retrieves the user's profile information.
   *
   * @returns The user's profile and token expiration.
   */
  @UseGuards(AuthGuard)
  @Get('profile')
  public async profile() {
    const user = await this.auth.user();
    const token = this.auth.token();

    return { user, exp: token.exp };
  }

  /**
   * Logs out the currently authenticated user.
   *
   * @param response - Express response object to clear cookies.
   * @returns A success message.
   */
  @UseGuards(AuthGuard)
  @Post('logout')
  public async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');

    return { message: 'success' };
  }

  /**
   * Deletes the account of the currently authenticated user.
   *
   * @param response - Express response object to clear cookies.
   * @returns A success message.
   */
  @UseGuards(AuthGuard)
  @Delete('delete')
  public async delete(@Res({ passthrough: true }) response: Response) {
    const user = await this.auth.user();
    const id = user.id;

    await this.auth.delete(id);
    response.clearCookie('jwt');

    return { message: 'success' };
  }
}
