import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/mysql';
import { User } from './user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CreateUser } from '../auth/auth.dto';
import * as bcrypt from 'bcrypt';
import { EditUser } from './user.controller';

@Injectable()
export class UserService {
  public static readonly SALT_OR_ROUNDS = 9;

  constructor(
    private readonly em: EntityManager,
    @InjectRepository(User)
    private readonly repository: EntityRepository<User>,
  ) {}

  public async findOne(id: number): Promise<User | null> {
    return this.repository.findOne(id);
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ email });
  }

  public async findAll(): Promise<User[]> {
    return this.repository.findAll();
  }

  public async find(ids: number[]): Promise<User[]> {
    return this.repository.find(ids);
  }

  public async create(data: CreateUser): Promise<User> {
    const password = await bcrypt.hash(
      data.password,
      UserService.SALT_OR_ROUNDS,
    );

    const user = new User(data.name, data.email, data.organization, password);

    await this.em.persistAndFlush(user);

    return user;
  }

  public async changePassword(user: User, password: string): Promise<void> {
    user.password = await bcrypt.hash(password, UserService.SALT_OR_ROUNDS);
    await this.em.persistAndFlush(user);
  }

  public async delete(id: number): Promise<void> {
    await this.repository.nativeDelete({ id });
  }

  public async changeUserData(data: EditUser): Promise<boolean> {
    const user = await this.findOne(data.id);
    user.name = data.name;
    user.email = data.email;
    user.organization = data.organization;
    await this.em.persistAndFlush(user);
    return true;
  }

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
