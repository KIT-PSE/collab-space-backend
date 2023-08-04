import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Custom validation decorator that checks if a property matches another property in the object.
 * @param property - The name of the related property to compare with.
 * @param options - Validation options.
 */
export function Match(property: string, options?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
}

/**
 * ValidatorConstraint that checks if a property matches another property in the object.
 */
@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  /**
   * Validate if a property matches another property in the object.
   * @param value - The value of the property to validate.
   * @param args - Validation arguments.
   * @returns A boolean indicating whether the properties match.
   */
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }
}
