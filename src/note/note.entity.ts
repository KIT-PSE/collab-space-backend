import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  types,
} from '@mikro-orm/core';
import { Room } from '../room/room.entity';

/**
 * Represents a Note entity that is associated with a Room.
 */
@Entity({ tableName: 'notes' })
export class Note {
  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @Property({ type: types.text, nullable: true })
  content;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne({ onDelete: 'cascade', hidden: true })
  room: Room;

  /**
   * Creates a new instance of the Note entity.
   * @param name - The name of the note.
   * @param room - The associated Room entity.
   */
  constructor(name: string, room: Room) {
    this.name = name;
    this.room = room;
  }
}
