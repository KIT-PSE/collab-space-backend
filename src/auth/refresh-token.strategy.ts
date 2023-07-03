import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtToken } from './auth.dto';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: RefreshTokenStrategy.fromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  public static fromCookie(req: Request): string {
    if (req && req.cookies) {
      return req.cookies['refresh_token'];
    }

    return null;
  }

  public async validate(payload: JwtToken) {
    return payload;
  }
}
