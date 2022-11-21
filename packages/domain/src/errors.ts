export class DomainError {
  /**
   *
   */
  constructor(public message: string) {}
}

export enum ExitCodes {
  CHANNEL_NOT_FOUND = 'CHANNEL_NOT_FOUND',
  CHANNEL_ALREADY_REGISTERED = 'CHANNEL_ALREADY_REGISTERED',
  CHANNEL_CRITERIA_UNMET_SUBSCRIBERS = 'CHANNEL_CRITERIA_UNMET_SUBSCRIBERS',
  CHANNEL_CRITERIA_UNMET_VIDEOS = 'CHANNEL_CRITERIA_UNMET_VIDEOS',
  CHANNEL_CRITERIA_UNMET_CREATION_DATE = 'CHANNEL_CRITERIA_UNMET_CREATION_DATE',
}

export class YoutubeAuthorizationError {
  constructor(
    public errorCode: ExitCodes,
    public message: string,
    public result?: number | string | Date,
    public expected?: number | string | Date
  ) {}
}
