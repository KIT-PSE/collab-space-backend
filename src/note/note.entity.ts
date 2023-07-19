import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Room } from '../room/room.entity';

@Entity({ tableName: 'notes' })
export class Note {
  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @Property()
  content: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne({ onDelete: 'cascade' })
  room: Room;

  constructor(name: string, room: Room) {
    this.name = name;
    this.room = room;
  }
}
