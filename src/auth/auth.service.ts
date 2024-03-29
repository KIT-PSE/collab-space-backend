import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginUser, CreateUser, AuthPayload, UpdateUser } from './auth.dto';
import { User } from '../user/user.entity';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { JwtToken } from './jwt.strategy';
import * as bcrypt from 'bcrypt';

/**
 * Service responsible for authentication-related operations.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly jwtService: JwtService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  /**
   * Handles user login.
   *
   * @param loginUser - Login credentials of the user.
   * @returns Authentication payload containing token, user, and expiration.
   * @throws UnauthorizedException if credentials are invalid.
   */
  public async login({ email, password }: LoginUser): Promise<AuthPayload> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createToken(user);
  }

  /**
   * Handles user registration.
   *
   * @param data - Registration data for the new user.
   * @returns Authentication payload containing token, user, and expiration.
   */
  public async register(data: CreateUser): Promise<AuthPayload> {
    const user = await this.users.create(data);

    return this.createToken(user);
  }

  /**
   * Updates the authenticated user.
   *
   * @param data - Data for updating the user.
   */
  public async updateUser(data: UpdateUser): Promise<User> {
    const user = await this.user();
    return this.users.update(user, data);
  }

  /**
   * Deletes a user by their ID.
   *
   * @param id - ID of the user to be deleted.
   * @returns Resolves when deletion is successful.
   */
  public async delete(id: number): Promise<number> {
    return this.users.delete(id);
  }

  /**
   * Creates an authentication payload (token, user, expiration).
   *
   * @param user - User entity for which to create the payload.
   * @returns Authentication payload containing token, user, and expiration.
   */
  private createToken(user: User): AuthPayload {
    const payload = { sub: user.id };
    const token = this.jwtService.sign(payload);
    const exp = this.jwtService.decode(token)['exp'];

    return { token, user, exp };
  }

  /**
   * Retrieves the currently authenticated user.
   *
   * @returns A Promise that resolves to the authenticated user entity.
   */
  public async user(): Promise<User> {
    return await this.users.findOne(this.token().sub);
  }

  /**
   * Retrieves the JWT token from the request.
   *
   * @returns The JWT token.
   */
  public token(): JwtToken {
    return this.request.user as JwtToken;
  }
}
