import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Room } from './room.entity';
import { EntityRepository } from '@mikro-orm/mysql';
import { Category } from '../category/category.entity';
import { Note } from '../note/note.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Service responsible for managing room entities.
 */
@Injectable()
export class RoomService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Room)
    private readonly repository: EntityRepository<Room>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Get a room by its ID and category.
   * @param id - The ID of the room.
   * @param category - The category of the room.
   * @returns The retrieved room.
   */
  public async get(id: number, category: Category): Promise<Room> {
    return this.repository.findOneOrFail({ id, category });
  }

  /**
   * Find a room with its associated category.
   * @param id - The ID of the room.
   * @returns The retrieved room with its category.
   */
  public async findOneWithCategory(id: number): Promise<Room | null> {
    return this.repository.findOne({ id }, { populate: ['category'] });
  }

  /**
   * Create a new room.
   * @param name - The name of the room.
   * @param category - The category of the room.
   * @param password - The optional password for the room.
   * @returns The created room.
   */
  public async create(
    name: string,
    category: Category,
    password?: string,
  ): Promise<Room> {
    const room = new Room(name, category, password);

    await this.em.persistAndFlush(room);
    return room;
  }

  /**
   * Update the name of a room.
   * @param id - The ID of the room.
   * @param category - The category of the room.
   * @param name - The new name for the room.
   * @param password - The optional password for the room.
   * @returns The updated room.
   */
  public async update(
    id: number,
    category: Category,
    name: string,
    password?: string,
  ): Promise<Room> {
    const room = await this.get(id, category);

    room.name = name;
    room.password = password;

    await this.em.persistAndFlush(room);

    return room;
  }

  /**
   * Delete a room.
   * @param id - The ID of the room.
   * @param category - The category of the room.
   */
  public async delete(id: number, category: Category): Promise<number> {
    const room = await this.get(id, category);

    if (!room) {
      throw new Error('Room not found');
    }

    this.eventEmitter.emit('room.deleted', room);

    return this.repository.nativeDelete({ id });
  }

  /**
   * Get the notes associated with a room.
   * @param id - The ID of the room.
   * @returns An array of notes belonging to the room.
   */
  public async getNotes(id: number): Promise<Note[]> {
    const room = await this.repository.findOneOrFail({ id });
    return room.notes.loadItems();
  }

  /**
   * Update the whiteboard canvas of a room.
   * @param id - The ID of the room.
   * @param canvas - The new whiteboard canvas content.
   * @returns The updated room.
   */
  public async updateWhiteboard(id: number, canvas: string): Promise<Room> {
    const room = await this.repository.findOneOrFail({ id });

    room.whiteboardCanvas = canvas;

    await this.em.persistAndFlush(room);

    return room;
  }
}
