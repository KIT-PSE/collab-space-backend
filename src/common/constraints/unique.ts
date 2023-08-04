import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

/**
 * Custom validation decorator that checks if a property value is unique within the specified entity.
 * @param entityType - The entity type to check for uniqueness.
 * @param options - Validation options.
 */
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

/**
 * ValidatorConstraint that checks if a property value is unique within the specified entity.
 */
@ValidatorConstraint({ name: 'IsUnique', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  /**
   * Constructor that injects the EntityManager.
   * @param em - The EntityManager instance.
   */
  constructor(private readonly em: EntityManager) {}

  /**
   * Validate if a property value is unique within the specified entity.
   * @param value - The value of the property to validate.
   * @param args - Validation arguments.
   * @returns A boolean indicating whether the property value is unique.
   */
  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [entityType] = args.constraints;

    const entity = await this.em.findOne(entityType, {
      [args.property]: value,
    });

    return !entity;
  }
}
