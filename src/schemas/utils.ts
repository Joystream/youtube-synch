import { JSONSchema7 } from 'json-schema'

export function objectSchema<
  P extends NonNullable<JSONSchema7['properties']>,
  D extends JSONSchema7['dependencies'],
  If extends JSONSchema7['if'],
  Then extends JSONSchema7['then']
>(props: {
  $id?: string
  title?: string
  description?: string
  properties: P
  dependencies?: D
  if?: If,
  then?: Then,
  required: Array<keyof P & string>
}): JSONSchema7 {
  return {
    type: 'object',
    additionalProperties: false,
    ...props,
  }
}
