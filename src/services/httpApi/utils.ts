import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator'

export function IsMutuallyExclusiveWith(property: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isMutuallyExclusiveWith',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const relatedValue = (args.object as any)[args.constraints[0]]
          return value === null || value === undefined || relatedValue === null || relatedValue === undefined
        },
        defaultMessage(args: ValidationArguments) {
          return `${propertyName} is exclusive with ${args.constraints[0]}`
        },
      },
    })
  }
}
