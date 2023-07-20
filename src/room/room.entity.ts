import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  types,
} from '@mikro-orm/core';
import {} from '@mikro-orm/mysql';
import { Category } from '../category/category.entity';

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

  @Property()
  channelId?: string;

  @Property({ type: types.blob, nullable: true })
  whiteboardCanvas?;

  constructor(name: string, category: Category, password?: string) {
    this.name = name;
    this.category = category;
    this.password = password;
  }

  public toString(): string {
    return `Room{${this.id}: "${this.name}"}`;
  }
}
