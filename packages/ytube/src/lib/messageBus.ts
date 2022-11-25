import { SNS } from 'aws-sdk'
import { Topic } from 'aws-sdk/clients/sns'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { DomainError, IEvent } from '@youtube-sync/domain'

// Available SNS topics
export const availableTopics = ['userEvents', 'channelEvents', 'videoEvents'] as const
export type AvailableTopic = typeof availableTopics[number]

// A message bus class to hold the list of all SNS Topics
export class MessageBus {
  private _sns: SNS
  private _topics: SNS.Topic[] = []
  constructor() {
    this._sns = new SNS()
  }

  /**
   * @param event Event tp be published
   * @param topic Topic to which publish the event
   * @returns published event
   */
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

  /**
   *
   * @param events Events tp be published
   * @param topic Topic to which publish the event
   * @returns published events
   */
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

  /**
   * @param name Get topic by name
   * @returns Topic
   */
  private async getTopic(name: AvailableTopic): Promise<Topic> {
    return await this.getOrInitTopics().then((topics) => {
      return topics.find((t) => t.TopicArn!.includes(name))!
    })
  }

  private async getOrInitTopics() {
    if (this._topics.length === availableTopics.length) {
      return this._topics
    }
    const topics = await this._sns.listTopics().promise()
    this._topics = topics.Topics ?? []
    return this._topics
  }
}
