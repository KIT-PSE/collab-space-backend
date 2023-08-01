import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  types,
} from '@mikro-orm/core';
import { Room } from '../room/room.entity';

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

  constructor(name: string, room: Room) {
    this.name = name;
    this.room = room;
  }
}
