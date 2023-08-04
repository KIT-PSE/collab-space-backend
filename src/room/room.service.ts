import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Room } from './room.entity';
import { EntityRepository } from '@mikro-orm/mysql';
import { Category } from '../category/category.entity';
import { Note } from '../note/note.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RoomService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Room)
    private readonly repository: EntityRepository<Room>,
    private eventEmitter: EventEmitter2,
  ) {}

  public async get(id: number, category: Category): Promise<Room> {
    return this.repository.findOneOrFail({ id, category });
  }

  public async findOneWithCategory(id: number): Promise<Room | null> {
    return this.repository.findOne({ id }, { populate: ['category'] });
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

    this.eventEmitter.emit('room.deleted', room);

    await this.em.removeAndFlush(room);
  }

  public async getNotes(id: number): Promise<Note[]> {
    const room = await this.repository.findOneOrFail({ id });
    return room.notes.loadItems();
  }

  public async updateWhiteboard(id: number, canvas: string): Promise<Room> {
    const room = await this.repository.findOneOrFail({ id });

    room.whiteboardCanvas = canvas;

    await this.em.persistAndFlush(room);

    return room;
  }
}
