import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Category } from './category.entity';
import { EntityRepository } from '@mikro-orm/mysql';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Category)
    private readonly repository: EntityRepository<Category>,
    private readonly auth: AuthService,
  ) {}

  public async allFromUser(): Promise<Category[]> {
    const user = await this.auth.user();

    return user.categories.loadItems();
  }

  public async create(name: string): Promise<Category> {
    const user = await this.auth.user();

    const category = new Category(name, user);

    await this.em.persistAndFlush(category);
    return category;
  }

  public async update(id: number, name: string): Promise<Category> {
    const category = await this.repository.findOne(id);

    category.name = name;

    await this.em.persistAndFlush(category);

    return category;
  }

  public async delete(id: number): Promise<void> {
    const category = await this.repository.findOne(id);

    await this.em.removeAndFlush(category);
  }
}
