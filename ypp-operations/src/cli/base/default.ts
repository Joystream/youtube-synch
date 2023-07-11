import Command, { flags } from '@oclif/command'
import { ApiPromise, WsProvider } from '@polkadot/api'
import BN from 'bn.js'
import chalk from 'chalk'
import inquirer, { DistinctQuestion } from 'inquirer'
import ExitCodes from './ExitCodes'
import { JoystreamCLI } from './joystreamCli'

export default abstract class DefaultCommandBase extends Command {
  protected autoConfirm!: boolean
  protected joystreamCli!: JoystreamCLI
  protected jsonPrettyIdent = ''
  protected tokenDecimals: number

  protected indentGroupsOpened = 0

  static flags = {
    yes: flags.boolean({
      required: false,
      default: false,
      description: 'Answer "yes" to any prompt, skipping any manual confirmations',
      char: 'y',
    }),
    rpcEndpoint: flags.string({
      required: false,
      default: 'wss://rpc.joystream.org:9944',
      description: 'RPC endpoint of the Joystream node to connect to',
    }),
    queryNodeEndpoint: flags.string({
      required: false,
      default: 'https://query.joystream.org/graphql',
      description: 'Query node endpoint to use',
    }),
    payerMemberId: flags.string({
      required: true,
      description: 'Joystream member Id of Reward payer account',
    }),
  }

  async init(): Promise<void> {
    const { yes, rpcEndpoint, queryNodeEndpoint } = this.parse(this.constructor as typeof DefaultCommandBase).flags
    const wsProvider: WsProvider = new WsProvider(rpcEndpoint)
    const api = new ApiPromise({ provider: wsProvider })
    await api.isReadyOrError

    const [properties] = await Promise.all([api.rpc.system.properties(), api.rpc.system.chainType()])

    this.tokenDecimals = properties.tokenDecimals.unwrap()[0].toNumber()
    this.joystreamCli = await this.createJoystreamCli(rpcEndpoint, queryNodeEndpoint)
    this.autoConfirm = !!(process.env.AUTO_CONFIRM === 'true' || parseInt(process.env.AUTO_CONFIRM || '') || yes)
  }

  asHapi(joy: number) {
    let joyBN = new BN(joy)
    let factor = new BN(10).pow(new BN(this.tokenDecimals))
    return joyBN.mul(factor).toString()
  }

  private async createJoystreamCli(apiEndpoint: string, qnEndpoint: string): Promise<JoystreamCLI> {
    // create Joystream CLI
    const joystreamCli = new JoystreamCLI(apiEndpoint, qnEndpoint)
    // init CLI
    await joystreamCli.init()
    return joystreamCli
  }

  async requireConfirmation(
    message = 'Are you sure you want to execute this action?',
    defaultVal = false
  ): Promise<void> {
    if (this.autoConfirm) {
      return
    }
    const { confirmed } = await inquirer.prompt([{ type: 'confirm', name: 'confirmed', message, default: defaultVal }])
    if (!confirmed) {
      this.exit(ExitCodes.OK)
    }
  }

  openIndentGroup(): void {
    console.group()
    ++this.indentGroupsOpened
  }

  closeIndentGroup(): void {
    console.groupEnd()
    --this.indentGroupsOpened
  }

  async simplePrompt<T = unknown>(question: DistinctQuestion): Promise<T> {
    const { result } = await inquirer.prompt([
      {
        ...question,
        name: 'result',
        // prefix = 2 spaces for each group - 1 (because 1 is always added by default)
        prefix: Array.from(new Array(this.indentGroupsOpened))
          .map(() => '  ')
          .join('')
          .slice(1),
      },
    ])

    return result
  }

  private jsonPrettyIndented(line: string): string {
    return `${this.jsonPrettyIdent}${line}`
  }

  private jsonPrettyOpen(char: '{' | '['): string {
    this.jsonPrettyIdent += '    '
    return chalk.gray(char) + '\n'
  }

  private jsonPrettyClose(char: '}' | ']'): string {
    this.jsonPrettyIdent = this.jsonPrettyIdent.slice(0, -4)
    return this.jsonPrettyIndented(chalk.gray(char))
  }

  private jsonPrettyArr(arr: unknown[]): string {
    return (
      this.jsonPrettyOpen('[') +
      arr.map((v) => this.jsonPrettyIndented(this.jsonPrettyAny(v))).join(',\n') +
      '\n' +
      this.jsonPrettyClose(']')
    )
  }

  private jsonPrettyKeyVal(key: string, val: unknown): string {
    return this.jsonPrettyIndented(chalk.magentaBright(`${key}: ${this.jsonPrettyAny(val)}`))
  }

  private jsonPrettyObj(obj: Record<string, unknown>): string {
    return (
      this.jsonPrettyOpen('{') +
      Object.keys(obj)
        .map((k) => this.jsonPrettyKeyVal(k, obj[k]))
        .join(',\n') +
      '\n' +
      this.jsonPrettyClose('}')
    )
  }

  private jsonPrettyAny(val: unknown): string {
    if (Array.isArray(val)) {
      return this.jsonPrettyArr(val)
    } else if (typeof val === 'object' && val !== null) {
      return this.jsonPrettyObj(val as Record<string, unknown>)
    } else if (typeof val === 'string') {
      return chalk.green(`"${val}"`)
    }

    // Number, boolean etc.
    return chalk.cyan(val)
  }

  jsonPrettyPrint(json: string): void {
    try {
      const parsed = JSON.parse(json)
      this.log(this.jsonPrettyAny(parsed))
    } catch (e) {
      this.log(this.jsonPrettyAny(json))
    }
  }

  async finally(err: unknown): Promise<void> {
    if (!err) this.exit(ExitCodes.OK)
    if (process.env.DEBUG === 'true') {
      console.error(err)
    }
    super.finally(err as Error)
  }

  async datePrompt(question: DistinctQuestion): Promise<Date> {
    // inquirer.registerPrompt('date', DatePrompt as any)
    const { result } = await inquirer.prompt([
      {
        ...question,
        type: 'date',
        name: 'result',
        clearable: true,
        // prefix = 2 spaces for each group - 1 (because 1 is always added by default)
        prefix: Array.from(new Array(this.indentGroupsOpened))
          .map(() => '  ')
          .join('')
          .slice(1),
      },
    ])

    const date = new Date(result)
    return date
  }
}
