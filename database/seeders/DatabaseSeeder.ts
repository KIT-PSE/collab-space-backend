import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../../src/user/user.entity';
import { Category } from '../../src/category/category.entity';
import { Room } from '../../src/room/room.entity';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../src/user/user.service';
import { fakerDE as faker } from '@faker-js/faker';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const password = await bcrypt.hash('12345', UserService.SALT_OR_ROUNDS);

    const user = em.create(User, {
      email: 'test@example.com',
      name: 'Test User',
      organization: faker.company.name(),
      password,
      role: 'admin',
    });

    this.generateRoomsFor(em, user);

    for (let i = 0; i < 2; i++) {
      this.generateUser(em, 'admin', password);
    }

    for (let i = 0; i < 10; i++) {
      this.generateUser(em, 'user', password);
    }
  }

  generateUser(em: EntityManager, role: 'user' | 'admin', password: string) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const user = em.create(User, {
      email: faker.internet.email({ firstName, lastName }),
      name: `${firstName} ${lastName}`,
      organization: faker.company.name(),
      password,
      role,
    });

    this.generateRoomsFor(em, user);
  }

  generateRoomsFor(em: EntityManager, user: User) {
    const categories = ['Mathe', 'Deutsch', 'Physik', 'Religion'];

    for (const category of categories) {
      const createdCategory = em.create(Category, {
        name: category,
        owner: user,
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
