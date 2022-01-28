import {SNS, Config} from 'aws-sdk'
import { Topic } from 'aws-sdk/clients/sns';
import { IEvent } from './domain';

export type AvailableTopic = 'userEvents' | 'channelEvents' | 'videoEvents'
export class MessageBus{
    /**
     *
     */
    private _sns: SNS
    private _config: Config
    private _topics: SNS.Topic[] = []
    constructor(private region: string) {
        this._config = new Config();
        this._config.update({region: region})
        this._sns = new SNS(this._config)
    }

    async publish<TEvent extends IEvent>(event: TEvent, topic: AvailableTopic){
        const tpc = await this.getTopic(topic);
        this._sns.publish({
            Message: JSON.stringify(event),
            TopicArn: tpc!.TopicArn!,
            Subject: event.subject
        })
    }
    async publishAll<TEvent extends IEvent>(events: TEvent[], topic: AvailableTopic): Promise<TEvent[]>{
        const tpc = await this.getTopic(topic);
        const promises = events
            .map(evt => <SNS.PublishInput>{Message: JSON.stringify(evt), TopicArn: tpc!.TopicArn!, Subject: evt.subject})
            .map(input => this._sns.publish(input).promise());
        await Promise.all(promises);
        return events;
    }

    private async getTopic(name: AvailableTopic):Promise<Topic>{
        return await this
            .getOrInitTopics()
            .then(topis => topis.find(t => t.TopicArn!.includes(name))!)
        
    }
    private async getOrInitTopics(){
        if(this._topics)
            return this._topics;
        const topics = await this._sns.listTopics().promise()
        this._topics = topics.Topics ?? []
        return this._topics
    }

}