import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Request } from 'express';

/**
 * Interface representing the JWT token structure.
 */
export interface JwtToken {
  sub: number;
  iat: number;
  exp: number;
}

/**
 * JWT authentication strategy using PassportStrategy.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: JwtStrategy.fromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * Retrieves the JWT token from the request cookie.
   *
   * @param req - Express request object.
   * @returns The JWT token from the cookie.
   */
  public static fromCookie(req: Request): string {
    if (req && req.cookies) {
      return req.cookies['jwt'];
    }

    return null;
  }

  /**
   * Validates the JWT token payload.
   *
   * @param payload - Decoded JWT token payload.
   * @returns The validated payload.
   */
  public async validate(payload: JwtToken) {
    return payload;
  }
}
