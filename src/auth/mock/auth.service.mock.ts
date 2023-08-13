import { User } from '../../user/user.entity';
import { AuthPayload, CreateUser, LoginUser } from '../auth.dto';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtToken } from '../jwt.strategy';

export class MockAuthService {
  private readonly testUserAuthPayload: AuthPayload = {
    user: this.testUser,
    token: 'sometesttoken',
    exp: Date.now() + 1000 * 60 * 60,
  };

  private readonly testJwtToken = {
    sub: this.testUser.id,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60,
  };

  constructor(private readonly testUser: User) {}

  public async login(data: LoginUser): Promise<AuthPayload> {
    if (
      data.email == this.testUser.email &&
      bcrypt.compareSync(data.password, this.testUser.password)
    ) {
      return Promise.resolve(this.testUserAuthPayload);
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  public async register(data: CreateUser): Promise<AuthPayload> {
    return Promise.resolve({
      ...this.testUserAuthPayload,
      user: {
        ...this.testUser,
        ...data,
      },
    });
  }

  public async delete(id: number): Promise<number> {
    if (id == this.testUser.id) {
      return Promise.resolve(1);
    } else {
      throw new UnauthorizedException('User not found');
    }
  }

  public async user(): Promise<User> {
    return Promise.resolve(this.testUser);
  }

  public token(): JwtToken {
    return this.testJwtToken;
  }
}
