import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginUser, CreateUser, AuthPayload } from './auth.dto';
import { User } from '../user/user.entity';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { JwtToken } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  public async login({ email, password }: LoginUser): Promise<AuthPayload> {
    const user = await this.userService.findByEmail(email);

    // TODO: password hashing and salting
    if (user?.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createToken(user);
  }

  public async register(data: CreateUser): Promise<AuthPayload> {
    // TODO: email verification

    const user = await this.userService.create(data);

    return this.createToken(user);
  }

  private createToken(user: User): AuthPayload {
    const payload = { sub: user.id };
    const token = this.jwtService.sign(payload);
    const exp = this.jwtService.decode(token)['exp'];

    return { token, user, exp };
  }

  public async user(): Promise<User> {
    return await this.userService.findOne(this.token().sub);
  }

  public token(): JwtToken {
    return this.request.user as JwtToken;
  }
}
