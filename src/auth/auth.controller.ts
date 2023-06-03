import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Response } from 'express';
import { RegisterUser, LoginUser } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('register')
  public async register(
    @Body() data: RegisterUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = await this.auth.register(data);

    response.cookie('jwt', payload.token, { httpOnly: true });

    return payload;
  }

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

  @UseGuards(AuthGuard)
  @Get('profile')
  public async profile() {
    const user = await this.auth.user();
    const token = this.auth.token();

    return { user, exp: token.exp };
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  public async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');

    return { message: 'success' };
  }
}
