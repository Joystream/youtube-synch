export namespace ExitCodes {
  export enum YoutubeApi {
    CHANNEL_NOT_FOUND = 'CHANNEL_NOT_FOUND',
    VIDEO_NOT_FOUND = 'VIDEO_NOT_FOUND',
    CHANNEL_ALREADY_REGISTERED = 'CHANNEL_ALREADY_REGISTERED',
    CHANNEL_STATUS_SUSPENDED = 'CHANNEL_STATUS_SUSPENDED',
    CHANNEL_CRITERIA_UNMET_SUBSCRIBERS = 'CHANNEL_CRITERIA_UNMET_SUBSCRIBERS',
    CHANNEL_CRITERIA_UNMET_VIDEOS = 'CHANNEL_CRITERIA_UNMET_VIDEOS',
    CHANNEL_CRITERIA_UNMET_CREATION_DATE = 'CHANNEL_CRITERIA_UNMET_CREATION_DATE',
    YOUTUBE_QUOTA_LIMIT_EXCEEDED = 'YOUTUBE_QUOTA_LIMIT_EXCEEDED',
    YOUTUBE_API_NOT_CONNECTED = 'YOUTUBE_API_NOT_CONNECTED',
  }

  export enum RuntimeApi {
    API_NOT_CONNECTED = 'API_NOT_CONNECTED',
    APP_NOT_FOUND = 'APP_NOT_FOUND',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    FAILED_ERROR = 'FAILED_ERROR',
    SIGN_CANCELLED = 'SIGN_CANCELLED',
    MISSING_REQUIRED_EVENT = 'MISSING_REQUIRED_EVENT',
    COLLABORATOR_NOT_FOUND = 'COLLABORATOR_NOT_FOUND',
  }

  export enum StorageApi {
    NO_ACTIVE_STORAGE_PROVIDER = 'NO_ACTIVE_STORAGE_PROVIDER',
  }

  export enum QueryNodeApi {
    OUTDATED_STATE = 'OUTDATED_STATE',
    QUERY_NODE_NOT_CONNECTED = 'QUERY_NODE_NOT_CONNECTED',
  }
}

export class YoutubeApiError {
  constructor(
    public code: ExitCodes.YoutubeApi,
    public message?: string,
    public result?: number | string | Date,
    public expected?: number | string | Date
  ) {}
}

export class RuntimeApiError {
  constructor(
    public code: ExitCodes.RuntimeApi,
    public message?: string,
    public result?: number | string | Date,
    public expected?: number | string | Date
  ) {}
}

export class StorageApiError {
  constructor(
    public code: ExitCodes.StorageApi,
    public message?: string,
    public result?: number | string | Date,
    public expected?: number | string | Date
  ) {}
}

export class QueryNodeApiError {
  constructor(
    public code: ExitCodes.QueryNodeApi,
    public message?: string,
    public result?: number | string | Date,
    public expected?: number | string | Date
  ) {}
}

export class FaucetApiError {
  constructor(
    public code: string,
    public message?: string,
    public result?: number | string | Date,
    public expected?: number | string | Date
  ) {}
}
