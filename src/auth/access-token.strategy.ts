import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Request } from 'express';
import { JwtToken } from './auth.dto';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: AccessTokenStrategy.fromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  public static fromCookie(req: Request): string {
    if (req && req.cookies) {
      return req.cookies['access_token'];
    }

    return null;
  }

  public async validate(payload: JwtToken) {
    return payload;
  }
}
