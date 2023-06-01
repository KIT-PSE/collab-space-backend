import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: JwtStrategy.fromCookie,
      ignoreExpiration: false,
      secretOrKey: 'secret',
    });
  }

  public static fromCookie(req: Request): string {
    if (req && req.cookies) {
      return req.cookies['jwt'];
    }

    return null;
  }

  public async validate(payload: any) {
    const user = await this.userService.findOne(payload.sub);
    return { ...user, exp: payload.exp };
  }
}
