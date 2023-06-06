import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/mysql';
import { User } from './user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CreateUser } from '../auth/auth.dto';
import * as bcrypt from 'bcrypt';
import { saltOrRounds } from '../auth/auth.service';

@Injectable()
export class UserService {
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

  public async create(data: CreateUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, saltOrRounds);

    const user = new User(
      data.name,
      data.email,
      data.organization,
      hashedPassword,
    );

    await this.em.persistAndFlush(user);

    return user;
  }
}
