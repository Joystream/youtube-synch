import { exec as execCallback } from 'child_process'
import pkgDir from 'pkg-dir'
import { promisify } from 'util'
import { Logger } from 'winston'

const exec = promisify(execCallback)

class EC2InstanceRestarter {
  private isRunning: boolean = false

  constructor() {}

  async restartInstance(logger: Logger) {
    if (this.isRunning) {
      logger.warn('Restart already in progress.')
      return
    }

    this.isRunning = true

    try {
      const scriptPath = `${pkgDir.sync(__dirname)}/socks5-proxy/restart-ec2-proxy-instance.sh`
      const { stdout } = await exec(scriptPath)
      logger.info(`EC2 instance restarted successfully: ${stdout}`)
    } catch (err) {
      logger.error(`Error occurred while restarting EC2 instance: ${(err as Error).message}`)
    } finally {
      this.isRunning = false
    }
  }
}

const instance = new EC2InstanceRestarter()

export default instance
