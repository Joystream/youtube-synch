import { Service } from '../../app'
import { Config } from '../../types'
import DefaultCommandBase from '../base/default'

export default class StartYoutubeSyncService extends DefaultCommandBase {
  static description = 'Start the node'

  static flags = {
    ...DefaultCommandBase.flags,
  }

  async run(): Promise<void> {
    const app = new Service(this.appConfig as Config)
    await app.start()
  }

  async finally(): Promise<void> {
    /* Do nothing */
  }
}
