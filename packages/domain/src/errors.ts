export class DomainError {
  /**
   *
   */
  constructor(public message: string) {}
}

export class YoutubeAuthorizationFailed extends DomainError {}
