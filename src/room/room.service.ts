import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Room } from './room.entity';
import { EntityRepository } from '@mikro-orm/mysql';
import { Category } from '../category/category.entity';

@Injectable()
export class RoomService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Room)
    private readonly repository: EntityRepository<Room>,
  ) {}

  public async get(id: number, category: Category): Promise<Room> {
    return this.repository.findOneOrFail({ id, category });
  }

  public async create(
    name: string,
    category: Category,
    password?: string,
  ): Promise<Room> {
    const room = new Room(name, category, password);

    await this.em.persistAndFlush(room);
    return room;
  }

  public async update(
    id: number,
    category: Category,
    name: string,
  ): Promise<Room> {
    const room = await this.get(id, category);

    room.name = name;

    await this.em.persistAndFlush(room);

    return room;
  }

  public async delete(id: number, category: Category): Promise<void> {
    const room = await this.get(id, category);

    await this.em.removeAndFlush(room);
  }
}
