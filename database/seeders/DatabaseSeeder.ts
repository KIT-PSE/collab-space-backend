import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../../src/user/user.entity';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    em.create(User, {
      email: 'test@example.com',
      name: 'Test User',
      organization: 'Test Organization',
      password: '12345',
    });
  }
}
