const getLogArgs = (message: string, details?: unknown) => {
  if (details) {
    return [message, details]
  }
  return [message]
}

type LogFn = (message: string, details?: unknown) => void

class _ConsoleLogger {
  log: LogFn = (message, details) => {
    console.log(...getLogArgs(message, details))
  }

  warn: LogFn = (message, details) => {
    console.warn(...getLogArgs(message, details))
  }

  error: LogFn = (message, details) => {
    console.error(...getLogArgs(message, details))
  }

  debug: LogFn = (message, details) => {
    console.debug(...getLogArgs(message, details))
  }
}

export const ConsoleLogger = new _ConsoleLogger()
