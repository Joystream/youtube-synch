import { spawn } from 'child_process'
import inquirer from 'inquirer'
import path from 'path'

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
  private cachedPassword: string

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

  async promptForPassword(message = 'Enter account password'): Promise<string> {
    const { password } = await inquirer.prompt([
      {
        name: 'password',
        type: 'password',
        message,
      },
    ])

    return password
  }

  async run(command: string, customArgs: string[] = []): Promise<CommandResult> {
    const debugCli = process.env.DEBUG_CLI === 'true'
    const { env } = this

    const func = async (): Promise<{
      exitCode: number
      exitSignal: string | null
    }> => {
      return new Promise((resolve, reject) => {
        const child = spawn(this.binPath, [command, ...this.getArgs(customArgs)], {
          env,
          stdio: ['pipe', 'pipe', 'pipe'],
          cwd: this.rootPath,
        })

        const cleanUp = (error: Error) => {
          if (debugCli) console.log('error:', error)
          child.kill() // Ensure the child process is terminated
          child.stdout?.removeAllListeners() // Remove all listeners
          child.stdin?.removeAllListeners()
          child.stderr.removeAllListeners()
          reject(error)
        }

        child.once('error', cleanUp)

        child.stdout?.on('data', (data) => {
          if (debugCli) console.log('stdout:', data.toString())
          if (data.toString().includes('account password [input is hidden]')) {
            if (this.cachedPassword) {
              child.stdin?.write(this.cachedPassword + '\n')
            } else {
              this.promptForPassword().then((password) => {
                this.cachedPassword = password
                child.stdin?.write(password + '\n')
              })
            }
          }
        })

        child.stderr.on('data', (data) => {
          if (debugCli) console.log('stderr:', data.toString())
          const dataStr = data.toString()
          if (dataStr.includes('Invalid password... Try again') || dataStr.includes('Not enough balance available')) {
            child.emit('error', new Error(dataStr))
          }
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

export class JoystreamCLI extends CLI {
  protected keys: string[] = []

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
