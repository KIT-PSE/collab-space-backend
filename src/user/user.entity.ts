/**
 * @fileOverview Definition of the User entity class.
 */

import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Category } from '../category/category.entity';

/**
 * Entity representing a user.
 */
@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  email!: string;

  @Property()
  organization!: string;

  @Property({ hidden: true })
  password!: string;

  @OneToMany(() => Category, (category) => category.owner, { hidden: true })
  categories = new Collection<Category>(this);

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  role: 'user' | 'admin' = 'user';

  /**
   * Constructor to create a new User instance.
   * @param name - The user's name.
   * @param email - The user's email.
   * @param organization - The user's organization.
   * @param password - The user's password.
   */
  constructor(
    name: string,
    email: string,
    organization: string,
    password: string,
  ) {
    this.name = name;
    this.email = email;
    this.organization = organization;
    this.password = password;
  }

  /**
   * Get a string representation of the user.
   * @returns A string containing user ID and name.
   */
  public toString(): string {
    return `User{${this.id}: "${this.name}"}`;
  }
}
