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
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Response, Request } from 'express';
import { RegisterUser, LoginUser } from './auth.dto';
import { User } from '../user/user.entity';
import { RefreshGuard } from './refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('register')
  public async register(
    @Body() data: RegisterUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ user: User }> {
    const payload = await this.auth.register(data);

    response.cookie('access_token', payload.access_token);
    response.cookie('refresh_token', payload.refresh_token, {
      httpOnly: true,
    });

    return { user: payload.user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  public async login(
    @Body() data: LoginUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ user: User }> {
    const payload = await this.auth.login(data);

    response.cookie('access_token', payload.access_token, {
      expires: new Date(Date.now() + 1000 * 60 * 15),
    });
    response.cookie('refresh_token', payload.refresh_token, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      httpOnly: true,
    });

    return { user: payload.user };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  public async profile() {
    console.log(1);
    const user = await this.auth.user();
    const token = this.auth.token();

    return { user, exp: token.exp };
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  public async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    // TODO: delete refresh token from db

    response.clearCookie('refresh_token');

    return { message: 'success' };
  }

  @UseGuards(AuthGuard)
  @Delete('delete')
  public async delete(@Res({ passthrough: true }) response: Response) {
    const user = await this.auth.user();
    const id = user.id;

    await this.auth.delete(id);
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');

    return { message: 'success' };
  }

  @UseGuards(RefreshGuard)
  @Get('refresh')
  public async refreshTokens(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const refreshToken = request.cookies['refresh'];

    const refresh_token = await this.auth.refreshAccessToken(refreshToken);
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
    });

    return { message: 'success' };
  }
}
