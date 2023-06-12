import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Category } from '../category/category.entity';

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

  public toString(): string {
    return `User{${this.id}: "${this.name}"}`;
  }
}
