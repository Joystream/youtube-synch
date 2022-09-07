export class DomainError {
  /**
   *
   */
  constructor(public message: string) {}
}

export class YoutubeAuthorizationFailed extends DomainError {}

export enum ExitCodes {
  CHANNEL_CRITERIA_UNMET_SUBSCRIBERS = 'CHANNEL_CRITERIA_UNMET_SUBSCRIBERS',
  CHANNEL_CRITERIA_UNMET_VIDEOS = 'CHANNEL_CRITERIA_UNMET_VIDEOS',
  CHANNEL_CRITERIA_UNMET_CREATION_DATE = 'CHANNEL_CRITERIA_UNMET_CREATION_DATE',
}

export interface ChannelVerificationFailed {
  errorCode: ExitCodes
  message: string
  result: number | string | Date
  expected: number | string | Date
}
