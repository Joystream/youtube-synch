interface Channel {
    id: string,
    title: string,
    frequency: number,
    description: string,
    userId: string,
    createdAt: number,
    thumbnails: {
        default: string,
        medium: string,
        high: string,
        maxRes: string,
        standard: string
    },
    statistics: {
        viewCount: number,
        commentCount: number,
        subscriberCount: number,
        videoCount: number
    },
    aggregatedStats: number
    userAccessToken: string,
    userRefreshToken: string,
    uploadsPlaylistId: string,
    shouldBeInjested: boolean
}
interface IEvent{
    timestamp: number,
    subject: string,
}

class IngestChannel implements IEvent{
    constructor(public channel: Channel, public timestamp: number) {
        this.channel = channel
        this.timestamp = timestamp;
    }
    subject = 'ingestChannel'
}
class UserCreated implements IEvent{
    constructor(public user: User, public timestamp: number) {
        this.user = user;
        this.timestamp = timestamp;
    }
    subject = 'userCreated'
}

class UserIngestionTriggered implements IEvent{
     constructor(public user: User, public timestamp: number) {
        this.user = user;
        this.timestamp = timestamp;
    }
    subject = "userIngestionTriggered"
}
class VideoEvent implements IEvent{
    constructor(
        public state: VideoState, 
        public videoId: string, 
        public channelId: string, 
        public timestamp: number,
        ) {
            this.subject = state
    }
    subject: string;
}

interface User{
    id: string
    email: string
    youtubeUsername: string
    googleId: string
    accessToken: string
    refreshToken: string,
    avatarUrl: string
    channelsCount: number
}

type VideoState = "new"
    | "uploadToJoystreamStarted"
    | "uploadToJoystreamFailed"
    | "uploadToJoystreamSucceded"
interface Video{
    url: string,
    title: string,
    description: string,
    id: string,
    playlistId: string,
    resourceId: string;
    channelId: string,
    thumbnails:{
        default: string,
        medium: string,
        high: string,
        maxRes: string,
        standard: string
    },
    state: VideoState,
    destinationUrl: string,
    createdAt: number
}

class Stats {
    quotaUsed: number
}
export {User, Channel, Video, VideoState, IngestChannel, VideoEvent, UserCreated, IEvent, Stats, UserIngestionTriggered}