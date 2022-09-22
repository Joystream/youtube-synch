import { SNS, Config } from 'aws-sdk'
import { Topic } from 'aws-sdk/clients/sns'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { DomainError, IEvent, Result } from '@youtube-sync/domain'

export type AvailableTopic = 'userEvents' | 'channelEvents' | 'videoEvents'
export class MessageBus {
  private _sns: SNS
  private _config: Config
  private _topics: SNS.Topic[] = []
  constructor(private region: string) {
    this._config = new Config()
    this._config.update({ region: region })
    this._sns = new SNS(this._config)
  }

  async publish<TEvent extends IEvent>(event: TEvent, topic: AvailableTopic): Promise<TEvent> {
    try {
      const tpc = await this.getTopic(topic)
      this._sns.publish({
        Message: JSON.stringify(event),
        TopicArn: tpc.TopicArn,
        Subject: event.subject,
      })
      return event
    } catch (error) {
      throw new Error(`Failed to publish event. Error ${error}`)
    }
  }

  async publishAll<TEvent extends IEvent>(events: TEvent[], topic: AvailableTopic): Promise<TEvent[]> {
    try {
      const tpc = await this.getTopic(topic)
      const promises = events
        .map(
          (event) =>
            <SNS.PublishInput>{
              Message: JSON.stringify(event),
              TopicArn: tpc.TopicArn,
              Subject: event.subject,
            }
        )
        .map((input) => this._sns.publish(input).promise())
      await Promise.all(promises)
      return events
    } catch (error) {
      new DomainError(`Failed to publish events, Error: ${error}`)
    }
  }

  private async getTopic(name: AvailableTopic): Promise<Topic> {
    return await this.getOrInitTopics().then((topics) => {
      console.log(topics)
      return topics.find((t) => t.TopicArn!.includes(name))!
    })
  }

  private async getOrInitTopics() {
    if (this._topics) return this._topics
    const topics = await this._sns.listTopics().promise()
    this._topics = topics.Topics ?? []
    return this._topics
  }
}
