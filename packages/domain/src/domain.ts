export interface Channel {
  id: string;
  title: string;
  frequency: number;
  description: string;
  userId: string;
  createdAt: number;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
    maxRes: string;
    standard: string;
  };
  statistics: {
    viewCount: number;
    commentCount: number;
    subscriberCount: number;
    videoCount: number;
  };
  aggregatedStats: number;
  userAccessToken: string;
  userRefreshToken: string;
  uploadsPlaylistId: string;
  shouldBeInjested: boolean;
  chainMetadata: ChannelChainMetadata
}

export class ChannelChainMetadata {
  id: string
}
export interface IEvent {
  timestamp: number;
  subject: string;
}

export class ChannelSpotted implements IEvent {
  /**
   *
   */
  constructor(public channel: Channel, public timestamp: number) {}
  subject = 'channelSpotted';
}
export class IngestChannel implements IEvent {
  constructor(public channel: Channel, public timestamp: number) {
    this.channel = channel;
    this.timestamp = timestamp;
  }
  subject = 'ingestChannel';
}
export class UserCreated implements IEvent {
  constructor(public user: User, public timestamp: number) {
    this.user = user;
    this.timestamp = timestamp;
  }
  subject = 'userCreated';
}

export class UserIngestionTriggered implements IEvent {
  constructor(public user: User, public timestamp: number) {
    this.user = user;
    this.timestamp = timestamp;
  }
  subject = 'userIngestionTriggered';
}
export class VideoEvent implements IEvent {
  constructor(
    public state: VideoState,
    public videoId: string,
    public channelId: string,
    public timestamp: number
  ) {
    this.subject = state;
  }
  subject: string;
}

export type Membership = {
  memberId: string,
  address: string,
  secret: string
}
export class User {
  /**
   *
   */
  constructor(public id: string,
    public email: string,
    public youtubeUsername: string,
    public googleId: string,
    public accessToken: string,
    public refreshToken: string,
    public avatarUrl: string,
    public channelsCount: number) {
  }

  membership: Membership
}

export type VideoState =
  | 'new'
  | 'uploadToJoystreamStarted'
  | 'uploadToJoystreamFailed'
  | 'uploadToJoystreamSucceded';
export interface Video {
  url: string;
  title: string;
  description: string;
  id: string;
  playlistId: string;
  resourceId: string;
  channelId: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
    maxRes: string;
    standard: string;
  };
  state: VideoState;
  destinationUrl: string;
  createdAt: number;
}

export class Stats {
  quotaUsed = 0
  date: number = Date.now()
  partition = 'stats'
}

export const getImages = (channel: Channel) => {
  return [
    ...urlAsArray(channel.thumbnails.default),
    ...urlAsArray(channel.thumbnails.high),
    ...urlAsArray(channel.thumbnails.maxRes),
    ...urlAsArray(channel.thumbnails.medium),
    ...urlAsArray(channel.thumbnails.standard),
  ]
}
const urlAsArray = (url:string) => url ? [url] : []