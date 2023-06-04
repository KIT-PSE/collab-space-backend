import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

export function Exists(entityType: object, options?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [entityType],
      validator: ExistsConstraint,
    });
  };
}

/*
 * This constraint checks if an entity with the given id exists.
 *
 * The given id must be a string, if it is a number, 0 will be considered as an empty value.
 */
@ValidatorConstraint({ name: 'Exists', async: true })
@Injectable()
export class ExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly em: EntityManager) {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    if (!value) {
      // if the value is empty, we don't want to
      // validate it because it might be optional
      return true;
    }

    const [entityType] = args.constraints;

    const entity = await this.em.findOne(entityType, value);

    return !!entity;
  }
}
