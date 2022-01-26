import { User, Channel, IngestChannel, Stats, Video, VideoEvent } from "./domain";
import { channelRepository, statsRepository, videoRepository } from "./database";
import { mapTo, MessageBus, YoutubeClient } from "..";
import { Condition } from "dynamoose/dist/Condition";

export class SyncService{
    private _youtube: YoutubeClient
    private _bus: MessageBus
    constructor(private youtube: YoutubeClient, private bus: MessageBus) {
    }
    async ingestChannels(user: User): Promise<IngestChannel[]>{
        if(!await this.canCallYoutube())
            return []

        return this._youtube
            .getChannels(user)
            .then(channels => {
                channelRepository().batchPut(channels);
                return channels;
            })
            .then(channels => channels.map(ch => new IngestChannel(ch, Date.now())))
            .then(events => this._bus.publishAll(events, 'channelEvents'));
    }

    async ingestFirstPageOfVideos(channel: Channel, top: number = 50){
        if(!await this.canCallYoutube())
            return []
        return await this._youtube
            .getVideos(channel, top)
            .then(videos => {
                videos.map(v => videoRepository().update({channelId: channel.id, id: v.id},v, {condition: new Condition().attribute('id').not().exists()}))
                return videos;
            })
            .then(videos => videos.map(
                (v) => new VideoEvent('new', v.id, v.channelId, Date.now())
            ))
            .then(events => this._bus.publishAll(events, 'videoEvents'))
    }
    async ingestAllVideos(channel: Channel){
        if(!await this.canCallYoutube())
            return []
        return await this._youtube
            .getAllVideos(channel)
            .then(videos => {
                videoRepository().update({}, {}, {condition: new Condition().attribute('id').not().exists()})
                return videos;
            })
            .then(videos => videos.map(
                (v) => new VideoEvent('new', v.id, v.channelId, Date.now())
            ))
            .then(events => this._bus.publishAll(events, 'videoEvents'))
    }

    async uploadVideo(video: Video){
        
    }

    private async canCallYoutube() : Promise<boolean>
    {
        const today = new Date();
        today.setUTCHours(0,0,0,0);
        const statsDoc = await statsRepository().get({partition:'stats', date: today.setUTCHours(0,0,0,0)});
        const stats = mapTo<Stats>(statsDoc);
        return stats.quotaUsed < 10000;
    }
}