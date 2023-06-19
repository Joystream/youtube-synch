import fs from 'fs'
import { JSONSchema4, JSONSchema4TypeName } from 'json-schema'
import _ from 'lodash'
import path from 'path'
import YAML from 'yaml'
import configSchema, { byteSizeUnits } from '../schemas/config'
import { Config } from '../types'
import { ValidationError, ValidationService } from './validation'

export class ConfigParserService {
  private configPath: string
  private validator: ValidationService

  constructor(configPath: string) {
    // Automatically load environment variables form .env file upon process initialization (if any)
    require('dotenv').config()

    this.validator = new ValidationService()
    this.configPath = configPath
  }

  public resolvePath(p: string): string {
    return path.resolve(path.dirname(this.configPath), p)
  }

  public resolveConfigDirectoryPaths(paths: Config['directories']): Config['directories'] {
    return _.mapValues(paths, (p) => this.resolvePath(p))
  }

  private parseByteSize(byteSize: string) {
    const intValue = parseInt(byteSize)
    const unit = byteSize[byteSize.length - 1]

    return intValue * Math.pow(1024, byteSizeUnits.indexOf(unit))
  }

  private schemaTypeOf(schema: JSONSchema4, path: string[]): JSONSchema4['type'] {
    if (schema.properties && schema.properties[path[0]]) {
      const item = schema.properties[path[0]]
      if (path.length > 1) {
        return this.schemaTypeOf(item, path.slice(1))
      }
      if (item.oneOf) {
        const validTypesSet = new Set<JSONSchema4TypeName>()
        item.oneOf.forEach(
          (s) =>
            Array.isArray(s.type)
              ? s.type.forEach((t) => validTypesSet.add(t))
              : s.type
              ? validTypesSet.add(s.type)
              : undefined // do nothing
        )
        return Array.from(validTypesSet)
      }
      return item.type
    }
  }

  private setConfigEnvValue(
    config: Record<string, unknown>,
    path: string[],
    envKey: string,
    envValue: string | undefined
  ) {
    const schemaType = this.schemaTypeOf(configSchema, path)
    const possibleTypes = Array.isArray(schemaType) ? schemaType : [schemaType]

    for (const i in possibleTypes) {
      try {
        if (envValue === 'off' || envValue === 'null' || envValue === 'undefined') {
          _.set(config, path, undefined)
        } else {
          switch (possibleTypes[i]) {
            case undefined:
              // Invalid key - skip
              break
            case 'integer':
              _.set(config, path, parseInt(envValue || ''))
              break
            case 'number':
              _.set(config, path, parseFloat(envValue || ''))
              break
            case 'boolean':
              _.set(config, path, !!envValue)
              break
            case 'array':
            case 'object':
              try {
                const parsed = JSON.parse(envValue || 'undefined')
                _.set(config, path, parsed)
              } catch (e) {
                throw new ValidationError(`Invalid env value of ${envKey}: Not a valid JSON`, null)
              }
              break
            default:
              _.set(config, path, envValue)
          }
        }
        const errors = this.validator.errorsByProperty('Config', path.join('/'), config)
        if (errors?.length) {
          throw new ValidationError(`Invalid env value`, errors)
        }
        return
      } catch (e) {
        // Only throw if there are no more possible types to test against
        if (parseInt(i) === possibleTypes.length - 1) {
          throw e
        }
      }
    }
  }

  private mergeEnvConfigWith(config: Record<string, unknown>) {
    Object.entries(process.env)
      .filter(([envKey]) => envKey.startsWith('YT_SYNCH__'))
      .forEach(([envKey, envValue]) => {
        const configPath = envKey
          .replace('YT_SYNCH__', '')
          .split('__')
          .map((key) => _.camelCase(key))
        this.setConfigEnvValue(config, configPath, envKey, envValue)
      })
  }

  public getNodeVersion(): string {
    const packageJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json')).toString())
    return String(packageJSON.version)
  }

  public parse(): Config {
    const { configPath } = this
    let inputConfig: Record<string, unknown> = {}
    // Try to load config from file if exists
    if (fs.existsSync(configPath)) {
      const fileContent = fs.readFileSync(configPath).toString()
      if (path.extname(configPath) === '.json') {
        inputConfig = JSON.parse(fileContent)
      } else if (path.extname(configPath) === '.yml' || path.extname(configPath) === '.yaml') {
        inputConfig = YAML.parse(fileContent)
      } else {
        throw new Error('Unrecognized config format (use .yml or .json)')
      }
    }

    // Override config with env variables
    this.mergeEnvConfigWith(inputConfig)

    // Validate the config
    const configJson = this.validator.validate('Config', inputConfig)

    // Normalize values
    const directories = this.resolveConfigDirectoryPaths(configJson.directories)
    const storageLimit = this.parseByteSize(configJson.limits.storage)

    const parsedConfig: Config = {
      ...configJson,
      version: this.getNodeVersion(),
      directories,
      limits: {
        ...configJson.limits,
        storage: storageLimit,
      },
    }

    return parsedConfig
  }
}
