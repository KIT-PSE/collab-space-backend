import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Category } from '../category/category.entity';
import { Note } from '../note/note.entity';

@Entity({ tableName: 'rooms' })
export class Room {
  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @Property({ hidden: true })
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

  constructor(name: string, category: Category, password?: string) {
    this.name = name;
    this.category = category;
    this.password = password;
  }

  public toString(): string {
    return `Room{${this.id}: "${this.name}"}`;
  }
}
