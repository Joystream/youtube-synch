enum CLIExitCodes {
  OK = 0,
  Error = 1,
  RuntimeApiError = 20,
  HttpApiError = 30,
  InvalidInput = 40,
  FileNotFound = 41,
  InvalidFile = 42,

  // NOTE: never exceed exit code 255 or it will be modulated by `256` and create problems
}
export default CLIExitCodes
