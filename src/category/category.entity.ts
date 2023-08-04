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

/**
 * Entity representing a category for rooms.
 */
@Entity({ tableName: 'categories' })
export class Category {
  /**
   * The primary key ID of the category.
   */
  @PrimaryKey()
  id: number;

  /**
   * The name of the category.
   */
  @Property()
  name: string;

  /**
   * The owner of the category.
   * Represents a many-to-one relationship with the User entity.
   */
  @ManyToOne({ hidden: true, onDelete: 'cascade' })
  owner: User;

  /**
   * Collection of rooms associated with this category.
   * Represents a one-to-many relationship with the Room entity.
   */
  @OneToMany(() => Room, (room) => room.category)
  rooms = new Collection<Room>(this);

  /**
   * The creation timestamp of the category.
   */
  @Property()
  createdAt: Date = new Date();

  /**
   * The update timestamp of the category.
   * Automatically updated when the category is modified.
   */
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  /**
   * Initializes a new Category instance.
   *
   * @param name - The name of the category.
   * @param owner - The owner of the category.
   */
  constructor(name: string, owner: User) {
    this.name = name;
    this.owner = owner;
  }
}
