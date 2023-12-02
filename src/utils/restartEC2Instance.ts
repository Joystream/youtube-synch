import { exec as execCallback } from 'child_process'
import pkgDir from 'pkg-dir'
import { promisify } from 'util'
import { Logger } from 'winston'

const exec = promisify(execCallback)

export async function restartEC2Instance(logger: Logger): Promise<void> {
  logger.error(`Encountered a 403 Forbidden error, restarting EC2 proxy server instance...`)
  try {
    const { stdout } = await exec(`${pkgDir.sync(__dirname)}/socks5-proxy/restart-ec2-proxy-instance.sh`)
    logger.info(`EC2 instance restarted successfully: ${stdout}`)
  } catch (err) {
    logger.error(`Error occurred while restarting EC2 instance: ${(err as Error).message}`)
  }
}
