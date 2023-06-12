import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Request } from 'express';
import { AuthService } from './auth.service';

export interface JwtToken {
  sub: number;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: JwtStrategy.fromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  public static fromCookie(req: Request): string {
    if (req && req.cookies) {
      return req.cookies['jwt'];
    }

    return null;
  }

  public async validate(payload: JwtToken) {
    const user = await this.authService.user();
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
