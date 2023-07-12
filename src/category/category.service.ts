import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Category } from './category.entity';
import { EntityRepository } from '@mikro-orm/mysql';
import { User } from '../user/user.entity';
import { ChannelService } from '../channel/channel.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Category)
    private readonly repository: EntityRepository<Category>,
    private readonly channels: ChannelService,
  ) {}

  public async allFromUser(user: User): Promise<Category[]> {
    const categories = await user.categories.loadItems({
      populate: ['rooms'],
    });

    for (const category of categories) {
      for (const room of category.rooms) {
        const channel = this.channels.getChannelFromRoom(room);
        if (channel) {
          room.channelId = channel.id;
        }
      }
    }

    return categories;
  }

  public async get(id: number, owner: User): Promise<Category> {
    return this.repository.findOneOrFail({ id, owner });
  }

  public async create(name: string, owner: User): Promise<Category> {
    const category = new Category(name, owner);

    await this.em.persistAndFlush(category);
    return category;
  }

  public async update(
    id: number,
    owner: User,
    name: string,
  ): Promise<Category> {
    const category = await this.get(id, owner);

    category.name = name;

    await this.em.persistAndFlush(category);

    return category;
  }

  public async delete(id: number, owner: User): Promise<void> {
    const category = await this.get(id, owner);

    await this.em.removeAndFlush(category);
  }
}
