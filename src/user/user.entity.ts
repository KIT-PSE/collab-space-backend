import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  email!: string;

  @Property()
  organization!: string;

  @Property()
  password!: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

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
}
