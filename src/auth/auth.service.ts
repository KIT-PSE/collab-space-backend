import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginUser, CreateUser, AuthPayload } from './auth.dto';
import { User } from '../user/user.entity';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { JwtToken } from './jwt.strategy';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly jwtService: JwtService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  public async login({ email, password }: LoginUser): Promise<AuthPayload> {
    const user = await this.users.findByEmail(email);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.createToken(user);
  }

  public async register(data: CreateUser): Promise<AuthPayload> {
    // TODO: email verification

    const user = await this.users.create(data);

    return this.createToken(user);
  }

  public async delete(id: number): Promise<void> {
    return await this.users.delete(id);
  }

  private createToken(user: User): AuthPayload {
    const payload = { sub: user.id };
    const token = this.jwtService.sign(payload);
    const exp = this.jwtService.decode(token)['exp'];

    return { token, user, exp };
  }

  public async user(): Promise<User> {
    return await this.users.findOne(this.token().sub);
  }

  public token(): JwtToken {
    return this.request.user as JwtToken;
  }
}
