import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Category } from './category.entity';
import { EntityRepository } from '@mikro-orm/mysql';
import { User } from '../user/user.entity';
import { ChannelService } from '../channel/channel.service';

/**
 * Service class responsible for handling category-related operations.
 */
@Injectable()
export class CategoryService {

  /**
   * Initializes an instance of the CategoryService.
   *
   * @param em - The EntityManager instance.
   * @param repository - The EntityRepository for the Category entity.
   * @param channels - The ChannelService instance.
   */
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Category)
    private readonly repository: EntityRepository<Category>,
    private readonly channels: ChannelService,
  ) {}

  /**
   * Retrieves all categories associated with a user, including their rooms.
   *
   * @param user - The user whose categories to retrieve.
   * @returns A promise that resolves to an array of Category instances.
   */
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

  /**
   * Retrieves a category by its ID and owner.
   *
   * @param id - The ID of the category to retrieve.
   * @param owner - The owner of the category.
   * @returns A promise that resolves to the retrieved Category instance.
   */
  public async get(id: number, owner: User): Promise<Category> {
    return this.repository.findOneOrFail({ id, owner });
  }

  /**
   * Creates a new category.
   *
   * @param name - The name of the new category.
   * @param owner - The owner of the new category.
   * @returns A promise that resolves to the created Category instance.
   */
  public async create(name: string, owner: User): Promise<Category> {
    const category = new Category(name, owner);

    await this.em.persistAndFlush(category);
    return category;
  }

  /**
   * Updates the name of a category.
   *
   * @param id - The ID of the category to update.
   * @param owner - The owner of the category.
   * @param name - The new name for the category.
   * @returns A promise that resolves to the updated Category instance.
   */
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

  /**
   * Deletes a category.
   *
   * @param id - The ID of the category to delete.
   * @param owner - The owner of the category.
   */
  public async delete(id: number, owner: User): Promise<void> {
    const category = await this.get(id, owner);

    await this.em.removeAndFlush(category);
  }
}
