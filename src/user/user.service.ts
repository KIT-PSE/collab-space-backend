import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/mysql';
import { User } from './user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CreateUser } from '../auth/auth.dto';
import * as bcrypt from 'bcrypt';
import { EditUser } from './user.controller';

/**
 * Service for user-related operations.
 */
@Injectable()
export class UserService {
  public static readonly SALT_OR_ROUNDS = 9;

  constructor(
    private readonly em: EntityManager,
    @InjectRepository(User)
    private readonly repository: EntityRepository<User>,
  ) {}

  /**
   * Find a user by ID.
   * @param id - The user's ID.
   * @returns A Promise that resolves to the found user or null if not found.
   */
  public async findOne(id: number): Promise<User | null> {
    return this.repository.findOne({ id });
  }

  /**
   * Find a user by email.
   * @param email - The user's email.
   * @returns A Promise that resolves to the found user or null if not found.
   */
  public async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ email });
  }

  /**
   * Find all users.
   * @returns A Promise that resolves to an array of all users.
   */
  public async findAll(): Promise<User[]> {
    return this.repository.findAll();
  }

  /**
   * Find users by IDs.
   * @param ids - An array of user IDs.
   * @returns A Promise that resolves to an array of found users.
   */
  public async find(ids: number[]): Promise<User[]> {
    return this.repository.find(ids);
  }

  /**
   * Create a new user.
   * @param data - Data for creating the user.
   * @returns A Promise that resolves to the created user.
   */
  public async create(data: CreateUser): Promise<User> {
    const password = await bcrypt.hash(
      data.password,
      UserService.SALT_OR_ROUNDS,
    );

    const user = new User(data.name, data.email, data.organization, password);

    await this.em.persistAndFlush(user);

    return user;
  }

  /**
   * Change a user's password.
   * @param user - The user entity.
   * @param password - The new password.
   */
  public async changePassword(user: User, password: string): Promise<void> {
    user.password = await bcrypt.hash(password, UserService.SALT_OR_ROUNDS);
    await this.em.persistAndFlush(user);
  }

  /**
   * Delete a user by ID.
   * @param id - The user's ID.
   * @returns A Promise that resolves to the number of deleted users.
   */
  public async delete(id: number): Promise<number> {
    const user = await this.repository.findOne({ id });

    if (!user) {
      throw new Error('User not found');
    }
    return this.repository.nativeDelete({ id });
  }

  /**
   * Change user data.
   * @param data - Updated user data.
   * @returns A Promise that resolves to a boolean indicating success.
   */
  public async changeUserData(data: EditUser): Promise<boolean> {
    const user = await this.findOne(data.id);
    user.name = data.name;
    user.email = data.email;
    user.organization = data.organization;
    await this.em.persistAndFlush(user);
    return true;
  }

  /**
   * Change user role.
   * @param id - The user's ID.
   * @returns A Promise that resolves to the updated user entity.
   */
  public async changeRole(id: number): Promise<User> {
    const user = await this.repository.findOne({ id });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      user.role = 'user';
    } else if (user.role === 'user') {
      user.role = 'admin';
    }

    await this.em.persistAndFlush(user);
    return user;
  }
}
