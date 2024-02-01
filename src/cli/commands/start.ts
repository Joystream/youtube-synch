import { flags } from '@oclif/command'
import { Service } from '../../app'
import { Config } from '../../types'
import DefaultCommandBase from '../base/default'

export default class StartYoutubeSyncService extends DefaultCommandBase {
  static description = 'Start the Youtube-Synch service/s.'

  static flags = {
    service: flags.enum<'httpApi' | 'sync' | 'both'>({
      required: false,
      description: 'Which service to start',
      options: ['httpApi', 'sync', 'both'],
      default: 'both',
    }),
    ...DefaultCommandBase.flags,
  }

  async run(): Promise<void> {
    const { service } = this.parse(StartYoutubeSyncService).flags
    const app = new Service(this.appConfig as Config)
    await app.start(service)
  }

  async finally(): Promise<void> {
    /* Do nothing */
  }
}
