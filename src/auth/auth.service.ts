import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginUser, CreateUser, Tokens, JwtToken } from './auth.dto';
import { User } from '../user/user.entity';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly jwtService: JwtService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  public async login({
    email,
    password,
  }: LoginUser): Promise<Tokens & { user: User }> {
    const user = await this.users.findByEmail(email);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.createTokens(user);

    return { ...tokens, user };
  }

  public async register(data: CreateUser): Promise<Tokens & { user: User }> {
    // TODO: email verification

    const user = await this.users.create(data);
    const tokens = await this.createTokens(user);

    return { ...tokens, user };
  }

  public async delete(id: number): Promise<void> {
    return await this.users.delete(id);
  }

  private async createTokens(user: User): Promise<Tokens> {
    const access_token = this.createAccessToken(user);
    const refresh_token = await this.createRefreshToken(user);

    return { access_token, refresh_token };
  }

  private createAccessToken(user: User): string {
    const payload = { sub: user.id };
    return this.jwtService.sign(payload, { expiresIn: '1m' });
  }

  private async createRefreshToken(user: User): Promise<string> {
    const payload = { sub: user.id };

    // Save the refresh token in the database
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    await this.users.updateRefreshToken(user.id, refreshToken);

    return refreshToken;
  }

  public async refreshAccessToken(refreshToken: string): Promise<string> {
    const user = await this.user();

    if (!user || !refreshToken) {
      throw new ForbiddenException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access denied');
    }

    return this.createAccessToken(user);
  }

  public async user(): Promise<User> {
    return await this.users.findOne(this.token().sub);
  }

  public token(): JwtToken {
    console.log(this.request.cookies.access_token);
    return this.jwtService.decode(
      this.request.cookies.access_token,
    ) as JwtToken;
  }
}
