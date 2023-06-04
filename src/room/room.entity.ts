import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
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

  constructor(name: string, category: Category, password?: string) {
    this.name = name;
    this.category = category;
    this.password = password;
  }
}
