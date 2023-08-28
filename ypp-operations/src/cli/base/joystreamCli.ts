import { KeyringPair } from '@polkadot/keyring/types'
import { spawn } from 'child_process'
import fs, { mkdirSync, rmdirSync } from 'fs'
import path from 'path'
import { v4 as uuid } from 'uuid'

const CLI_ROOT_PATH = path.resolve(__dirname, '../../../node_modules/@joystream/cli')

// ICreatedContentData
export interface ChannelPaymentParams {
  payments: {
    channelId: string
    amount: string
  }[]
  rationale: string | undefined
  payerMemberId: string
}

export type CommandResult = {
  exitCode: number
  exitSignal: string | null
}

export abstract class CLI {
  protected env: Record<string, string>
  protected readonly rootPath: string
  protected readonly binPath: string
  protected defaultArgs: string[]

  constructor(rootPath: string, defaultEnv: Record<string, string> = {}, defaultArgs: string[] = []) {
    this.rootPath = rootPath
    this.binPath = path.resolve(rootPath, './bin/run')
    this.env = {
      ...process.env,
      AUTO_CONFIRM: 'true',
      FORCE_COLOR: '0',
      ...defaultEnv,
    }
    this.defaultArgs = [...defaultArgs]
  }

  protected getArgs(customArgs: string[]): string[] {
    return [...this.defaultArgs, ...customArgs]
  }

  async run(command: string, customArgs: string[] = []): Promise<CommandResult> {
    const { env } = this

    const func = async (): Promise<{
      exitCode: number
      exitSignal: string | null
    }> => {
      return new Promise((resolve, reject) => {
        const child = spawn(this.binPath, [command, ...this.getArgs(customArgs)], {
          env,
          stdio: 'inherit', // this is the important part for handling interactive input
          cwd: this.rootPath,
        })

        child.on('error', (error) => {
          reject(error)
        })

        child.on('close', (code, signal) => {
          resolve({
            exitCode: code || 0,
            exitSignal: signal,
          })
        })
      })
    }

    const { exitCode, exitSignal } = await func()
    const response = {
      exitCode,
      exitSignal,
    }

    return response
  }
}

export class TmpFileManager {
  tmpDataDir: string

  constructor(baseDir?: string) {
    this.tmpDataDir = path.join(
      baseDir || process.env.DATA_PATH || path.join(__filename, '../../../../tmp'),
      '',
      uuid()
    )
    mkdirSync(this.tmpDataDir, { recursive: true })
  }

  public jsonFile(value: unknown): string {
    const jsonIndent = 4
    const tmpFilePath = path.join(this.tmpDataDir, `${uuid()}.json`)
    fs.writeFileSync(tmpFilePath, JSON.stringify(value, null, jsonIndent))

    return tmpFilePath
  }

  rmTempDir() {
    rmdirSync(this.tmpDataDir, { recursive: true })
  }
}

export class JoystreamCLI extends CLI {
  protected keys: string[] = []
  protected tmpFileManager: TmpFileManager

  private apiEndpoint: string
  private qnEndpoint: string

  constructor(apiEndpoint: string, qnEndpoint: string) {
    super(CLI_ROOT_PATH)
    this.apiEndpoint = apiEndpoint
    this.qnEndpoint = qnEndpoint
  }

  /**
    Inits all required connections, etc.
  */
  async init(): Promise<void> {
    await this.run('api:setUri', [this.apiEndpoint])
    await this.run('api:setQueryNodeEndpoint', [this.qnEndpoint])
  }

  /**
    Imports accounts key to CLI.
  */
  async importAccount(pair: KeyringPair): Promise<void> {
    const password = ''
    const jsonFile = this.tmpFileManager.jsonFile(pair.toJson())
    await this.run('account:import', [
      '--backupFilePath',
      jsonFile,
      '--name',
      `Account${this.keys.length}`,
      '--password',
      password,
    ])
    this.keys.push(pair.address)
  }

  /**
    Runs Joystream CLI command.
  */
  async run(command: string, customArgs: string[] = []): Promise<CommandResult> {
    return super.run(command, customArgs)
  }

  /**
    make payment to a channel/s.
  */
  async directChannelPayment(args: ChannelPaymentParams): Promise<void> {
    const channelsAndAmountsArgs = args.payments.flatMap(({ channelId, amount }) => [
      `--channelId`,
      channelId,
      `--amount`,
      amount,
    ])
    const { exitCode, exitSignal } = await this.run('content:directChannelPayment', [
      ...channelsAndAmountsArgs,
      '--rationale',
      args.rationale || '',
      '--useMemberId',
      args.payerMemberId,
    ])

    if (exitCode || exitSignal) {
      throw new Error(
        `Failed to execute joystreamCLI.content:directChannelPayment command, ${JSON.stringify({
          exitCode,
          exitSignal,
        })}`
      )
    }
  }
}
