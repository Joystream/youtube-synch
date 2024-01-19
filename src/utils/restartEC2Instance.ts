import { exec as execCallback } from 'child_process'
import pkgDir from 'pkg-dir'
import { promisify } from 'util'
import { Logger } from 'winston'

const exec = promisify(execCallback)

class EC2InstanceRestarter {
  private static instance: EC2InstanceRestarter = new EC2InstanceRestarter()
  private isRunning: boolean = false

  private constructor() {}

  public static getInstance(): EC2InstanceRestarter {
    return this.instance
  }

  async restartInstance(logger: Logger) {
    if (this.isRunning) {
      logger.warn('Restart already in progress.')
      return
    }

    this.isRunning = true
    logger.error(`Encountered a 403 Forbidden error, restarting EC2 proxy server instance...`)

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

const instance = EC2InstanceRestarter.getInstance()

export default instance
