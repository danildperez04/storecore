import {
  registerDecorator,
  ValidatorConstraint,
  type ValidationArguments,
  type ValidationOptions,
  type ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isGreaterThanProperty' })
class IsGreaterThanPropertyConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints as [string];
    const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
    // Si alguno de los dos no es numérico, no es este validador quien lo reporta:
    // el `@IsNumber()` de cada campo ya marca el error de tipo por separado.
    if (typeof value !== 'number' || typeof relatedValue !== 'number') return true;
    return value > relatedValue;
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints as [string];
    return `${args.property} debe ser mayor que ${relatedPropertyName}`;
  }
}

/**
 * Valida que una propiedad numérica sea mayor que otra propiedad del mismo
 * objeto. Usado por `salePrice` contra `purchasePrice` (RF-10): el precio de
 * venta debe ser mayor al de compra.
 */
export function IsGreaterThanProperty(
  property: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isGreaterThanProperty',
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [property],
      validator: IsGreaterThanPropertyConstraint,
    });
  };
}
