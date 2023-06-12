import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from '../user/user.entity';
import { Room } from '../room/room.entity';

@Entity({ tableName: 'categories' })
export class Category {
  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @ManyToOne({ hidden: true, onDelete: 'cascade' })
  owner: User;

  @OneToMany(() => Room, (room) => room.category)
  rooms = new Collection<Room>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(name: string, owner: User) {
    this.name = name;
    this.owner = owner;
  }
}
