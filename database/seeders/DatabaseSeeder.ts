import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../../src/user/user.entity';
import { Category } from '../../src/category/category.entity';
import { Room } from '../../src/room/room.entity';
import * as bcrypt from 'bcrypt';
import { saltOrRounds } from '../../src/auth/auth.service';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const hashedPassword = await bcrypt.hash('12345', saltOrRounds);

    em.create(User, {
      email: 'test@example.com',
      name: 'Test User',
      organization: 'Test Organization',
      password: hashedPassword,
      role: 'admin',
    });

    const categories = ['Mathe', 'Deutsch', 'Physik', 'Religion'];

    for (const category of categories) {
      const createdCategory = em.create(Category, {
        name: category,
        owner: em.getReference(User, 1),
      });

      const rooms = Math.floor(Math.random() * 7);
      for (let i = 0; i < rooms; i++) {
        em.create(Room, {
          name: randomClassName(),
          category: createdCategory,
        });
      }
    }
  }
}

function randomClassName() {
  const classNumber = Math.floor(Math.random() * 7) + 6;
  const classLetter = 'abcdef'[Math.floor(Math.random() * 6)];

  return `Klasse ${classNumber} ${classLetter}`;
}
