import { DomainError, IEvent } from '@youtube-sync/domain'
import { SNS } from 'aws-sdk'
import { Topic } from 'aws-sdk/clients/sns'

// Available SNS topics
export const availableTopics = ['userEvents', 'channelEvents', 'createVideoEvents', 'uploadVideoEvents'] as const
export type AvailableTopic = typeof availableTopics[number]
export type SubscriptionConfirmationRequest = {
  Type: 'SubscriptionConfirmation'
  MessageId: string
  Token: string
  TopicArn: string
  Message: string
  SubscribeURL: string
  Timestamp: string
  SignatureVersion: string
  Signature: string
  SigningCertURL: string
}

// A message bus class to hold the list of all SNS Topics
export class SnsClient {
  private sns: SNS
  private topics: SNS.Topic[] = []
  constructor() {
    this.sns = new SNS()
  }

  /**
   * @param event Event tp be published
   * @param topic Topic to which publish the event
   * @returns published event
   */
  async publish<TEvent extends IEvent>(event: TEvent, topic: AvailableTopic): Promise<TEvent> {
    try {
      const tpc = await this.getTopic(topic)
      await this.sns
        .publish({
          Message: JSON.stringify(event),
          TopicArn: tpc.TopicArn,
          Subject: event.subject,
        })
        .promise()
      return event
    } catch (error) {
      throw new Error(`Failed to publish event. Error ${error}`)
    }
  }

  /**
   * @param topic Topic to which subscribe
   * @returns published event
   */
  async subscribe(topic: AvailableTopic, endpoint: URL) {
    try {
      const tpc = await this.getTopic(topic)
      await this.sns
        .subscribe({
          TopicArn: tpc.TopicArn,
          Protocol: endpoint.protocol.replace(':', ''),
          Endpoint: endpoint.toString(),
        })
        .promise()
    } catch (error) {
      throw new Error(`Failed to Subscribe to event. Error ${error}`)
    }
  }

  /**
   * @param topic confirm subscription to topic by consumer
   * @returns published event
   */
  async confirmSubscription(topic: AvailableTopic, token: string) {
    try {
      const tpc = await this.getTopic(topic)
      await this.sns
        .confirmSubscription({
          TopicArn: tpc.TopicArn,
          Token: token,
        })
        .promise()
    } catch (error) {
      throw new Error(`Failed to Confirm Subscription to topic. Error ${error}`)
    }
  }

  /**
   *
   * @param events Events tp be published
   * @param topic Topic to which publish the event
   * @returns published events
   */
  async publishAll<TEvent extends IEvent>(events: TEvent[], topic: AvailableTopic) {
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
        .map((input) => this.sns.publish(input).promise())
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
  private async getTopic(name: AvailableTopic): Promise<Required<Topic>> {
    const topic = await this.getOrInitTopics().then((topics) => {
      return topics.find((t) => t.TopicArn?.includes(name))
    })

    if (!topic || !topic.TopicArn) {
      throw new Error(`Topic ${name} not found`)
    }

    return topic as Required<Topic>
  }

  private async getOrInitTopics() {
    if (this.topics.length === availableTopics.length) {
      return this.topics
    }
    const topics = await this.sns.listTopics().promise()
    this.topics = topics.Topics ?? []
    return this.topics
  }
}
