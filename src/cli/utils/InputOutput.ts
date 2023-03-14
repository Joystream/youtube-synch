import { flags } from '@oclif/command'
import { CLIError } from '@oclif/errors'
import Ajv from 'ajv'
import ExitCodes from '../base/ExitCodes'
import fs from 'fs'

export const IOFlags = {
  input: flags.string({
    char: 'i',
    required: false,
    description: `Path to JSON file to use as input (if not specified - the input can be provided interactively)`,
  }),
  output: flags.string({
    char: 'o',
    required: false,
    description:
      'Path to the directory where the output JSON file should be placed (the output file can be then reused as input)',
  }),
}

export async function getInputJson<T>(inputPath: string, schema?: unknown): Promise<T> {
  let content, jsonObj
  try {
    content = fs.readFileSync(inputPath).toString()
  } catch (e) {
    throw new CLIError(`Cannot access the input file at: ${inputPath}`, { exit: ExitCodes.FileNotFound })
  }
  try {
    jsonObj = JSON.parse(content)
  } catch (e) {
    throw new CLIError(`JSON parsing failed for file: ${inputPath}`, { exit: ExitCodes.InvalidInput })
  }
  if (schema) {
    await validateInput(jsonObj, schema)
  }

  return jsonObj as T
}

export async function validateInput(input: unknown, schema: unknown): Promise<void> {
  const ajv = new Ajv({ allErrors: true })
  const valid = ajv.validate(schema as any, input) as boolean
  if (!valid) {
    throw new CLIError(
      `Input JSON file is not valid:\n` +
        ajv.errors?.map((e) => `${e.dataPath}: ${e.message} (${JSON.stringify(e.params)})`).join('\n')
    )
  }
}
