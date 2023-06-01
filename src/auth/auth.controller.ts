import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  public async login(
    @Body() data,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, user, exp } = await this.authService.login(
      data.email,
      data.password,
    );

    response.cookie('jwt', token, { httpOnly: true });

    return { user: { ...user, exp } };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  public profile(@Request() request) {
    return { user: request.user };
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  public async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');

    return { message: 'success' };
  }
}
