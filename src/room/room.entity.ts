import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  types,
} from '@mikro-orm/core';
import { Category } from '../category/category.entity';
import { Note } from '../note/note.entity';

/**
 * Represents a room entity.
 */
@Entity({ tableName: 'rooms' })
export class Room {
  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @Property()
  password?: string;

  @ManyToOne({ onDelete: 'cascade' })
  category: Category;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ persist: false })
  channelId?: string;

  @OneToMany(() => Note, (note) => note.room)
  notes = new Collection<Note>(this);

  @Property({ type: types.blob, nullable: true })
  whiteboardCanvas?;

  /**
   * Creates a new instance of the Room class.
   * @param name - The name of the room.
   * @param category - The category that the room belongs to.
   * @param password - The password for the room (optional).
   */
  constructor(name: string, category: Category, password?: string) {
    this.name = name;
    this.category = category;
    this.password = password;
  }

  /**
   * Returns a string representation of the room.
   */
  public toString(): string {
    return `Room{${this.id}: "${this.name}"}`;
  }
}
