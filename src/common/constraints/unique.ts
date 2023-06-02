import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

export function IsUnique(entityType: object, options?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [entityType],
      validator: IsUniqueConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsUnique', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly em: EntityManager) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [entityType] = args.constraints;

    const entity = await this.em.findOne(entityType, {
      [args.property]: value,
    });

    return !entity;
  }
}
