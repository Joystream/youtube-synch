import {youtube_v3} from "@googleapis/youtube";
import {OAuth2Client} from 'google-auth-library'
import * as ytdl from 'ytdl-core'
import Schema$PlaylistItem = youtube_v3.Schema$PlaylistItem;
import {Channel, User, Video} from "./domain";
import {Readable} from "stream";
export class YoutubeClient{
    private readonly _auth: OAuth2Client;
    constructor(clientId: string, clientSecret: string, redirectUri: string) {
        this._auth = new OAuth2Client({
            clientId,
            clientSecret,
            redirectUri
        });
    }
    async getUserFromCode(code: string){
        const tokenResponse = await this._auth.getToken(code);
        const tokenInfo = await this._auth.getTokenInfo(tokenResponse.tokens.access_token);
        const user: User = {
            id: tokenInfo.sub,
            avatarUrl:'',
            accessToken: tokenResponse.tokens.access_token,
            refreshToken: tokenResponse.tokens.refresh_token,
            email: tokenInfo.email,
            googleId: tokenInfo.sub,
            youtubeUsername: tokenInfo.email
        }
        return user
    }

    async getChannels(user: User) : Promise<Channel[]> {
        this._auth.setCredentials({access_token: user.accessToken, refresh_token: user.refreshToken});
        const youtube = new youtube_v3.Youtube({auth: this._auth})
        const channels = await youtube.channels.list({
            part: ['snippet', 'contentDetails', 'statistics'],
            mine: true
        });
        return channels.data.items?.map<Channel>(item => <Channel>{
            id: item.id,
            description: item.snippet?.description,
            title: item.snippet?.title,
            userId: user.id,
            userAccessToken: user.accessToken,
            userRefreshToken: user.refreshToken,
            thumbnails: {
                default: item.snippet?.thumbnails?.default?.url,
                medium: item.snippet?.thumbnails?.medium?.url,
                high:  item.snippet?.thumbnails?.high?.url,
                maxRes:  item.snippet?.thumbnails?.maxres?.url,
                standard:  item.snippet?.thumbnails?.standard?.url
            },
            statistics: {
                viewCount: parseInt(item.statistics?.viewCount ?? '0'),
                subscriberCount: parseInt(item.statistics?.subscriberCount ?? '0'),
                videoCount: parseInt(item.statistics?.videoCount ?? '0'),
                commentCount: parseInt(item.statistics?.commentCount ?? '0')
            },
            uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads,
            frequency: 0,
            createdAt: Date.now()
        }) ?? []

    }
    async getVideos(channel: Channel, top: number):Promise<Video[]>{
        this._auth.setCredentials({access_token: channel.userAccessToken, refresh_token: channel.userRefreshToken});
        const youtube = new youtube_v3.Youtube({auth: this._auth});
        const videos = await youtube.playlistItems.list({
            part: ['contentDetails', 'snippet', 'id', 'status'],
            playlistId: channel.uploadsPlaylistId,
            maxResults: top
        });
        return this.mapVideos(videos.data.items ?? [])
    }
    async getAllVideos(channel: Channel): Promise<Video[]>{
        this._auth.setCredentials({access_token: channel.userAccessToken, refresh_token: channel.userRefreshToken});
        const youtube = new youtube_v3.Youtube({auth: this._auth});
        let videos: Video[] = []
        let continuation: string;
        do{
            const nextPage = await youtube.playlistItems.list({
                part: ['contentDetails', 'snippet', 'id', 'status'],
                playlistId: channel.uploadsPlaylistId,
                maxResults: 50
            });
            continuation = nextPage.data.nextPageToken ?? '';
            const page = this.mapVideos(nextPage.data.items??[])
            videos = [...videos, ...page]
        }while (continuation)
        return videos;
    }
    downloadVideo(videoUrl: string): Readable{
        return ytdl(videoUrl)
    }
    private mapVideos(items: Schema$PlaylistItem[]){
        return items.map(item => <Video>{
            id: item.id,
            description: item.snippet?.description,
            title: item.snippet?.title,
            channelId: item.snippet?.channelId,
            thumbnails: {
                high: item.snippet?.thumbnails?.high?.url,
                medium: item.snippet?.thumbnails?.medium?.url,
                maxRes: item.snippet?.thumbnails?.maxres?.url,
                standard: item.snippet?.thumbnails?.standard?.url,
                default: item.snippet?.thumbnails?.default?.url,
            },
            playlistId: item.snippet?.playlistId,
            url: `https://youtube.com/watch?v=${item.snippet?.resourceId?.videoId}`,
            resourceId: item.snippet?.resourceId?.videoId,
            createdAt: Date.now(),
            state:'new'
        })
    }
}