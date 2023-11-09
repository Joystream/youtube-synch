import AsyncLock from 'async-lock'
import * as dynamoose from 'dynamoose'
import { ConditionInitializer } from 'dynamoose/dist/Condition'
import { AnyItem } from 'dynamoose/dist/Item'
import { Query, QueryResponse, Scan, ScanResponse } from 'dynamoose/dist/ItemRetriever'
import { DYNAMO_MODEL_OPTIONS, IRepository, mapTo } from '.'
import { ResourcePrefix, WhitelistChannel } from '../types/youtube'

function whitelistChannelsModel(tablePrefix: ResourcePrefix) {
  const schema = new dynamoose.Schema(
    {
      channelHandle: {
        type: String,
        hashKey: true,
      },
    },
    {
      saveUnknown: false,
      timestamps: {
        createdAt: {
          createdAt: {
            type: {
              value: Date,
              settings: {
                storage: 'iso',
              },
            },
          },
        },
      },
    }
  )
  return dynamoose.model(`${tablePrefix}whitelistChannels`, schema, DYNAMO_MODEL_OPTIONS)
}

export class WhitelistChannelsRepository implements IRepository<WhitelistChannel> {
  private model

  // lock any updates on whitelistChannels table
  private readonly ASYNC_LOCK_ID = 'whitelistChannels'
  private asyncLock: AsyncLock = new AsyncLock({ maxPending: Number.MAX_SAFE_INTEGER })
  private useLock: boolean // Flag to determine if locking should be used

  constructor(tablePrefix: ResourcePrefix, useLock: boolean = true) {
    this.model = whitelistChannelsModel(tablePrefix)
    this.useLock = useLock
  }

  private async withLock<T>(func: () => Promise<T>): Promise<T> {
    if (this.useLock) {
      return this.asyncLock.acquire(this.ASYNC_LOCK_ID, func)
    } else {
      return func()
    }
  }

  async upsertAll(): Promise<WhitelistChannel[]> {
    throw new Error('Not implemented')
  }

  async scan(init: ConditionInitializer, f: (q: Scan<AnyItem>) => Scan<AnyItem>): Promise<WhitelistChannel[]> {
    return this.withLock(async () => {
      let lastKey = undefined
      const results = []
      do {
        let scannedBatch: ScanResponse<AnyItem> = await f(this.model.scan(init))
          .startAt(lastKey as any)
          .exec()
        let batchResult = scannedBatch.map((b) => mapTo<WhitelistChannel>(b))
        results.push(...batchResult)
        lastKey = scannedBatch.lastKey
      } while (lastKey)
      return results
    })
  }

  async get(channelId: string): Promise<WhitelistChannel | undefined> {
    return this.withLock(async () => {
      const result = await this.model.get(channelId)
      return result ? mapTo<WhitelistChannel>(result) : undefined
    })
  }

  async save(model: WhitelistChannel): Promise<WhitelistChannel> {
    return this.withLock(async () => {
      const result = await this.model.update(model)
      return mapTo<WhitelistChannel>(result)
    })
  }

  async delete(channelId: string): Promise<void> {
    return this.withLock(async () => {
      await this.model.delete(channelId)
      return
    })
  }

  async query(init: ConditionInitializer, f: (q: Query<AnyItem>) => Query<AnyItem>) {
    return this.withLock(async () => {
      let lastKey = undefined
      const results = []
      do {
        let queriedBatch: QueryResponse<AnyItem> = await f(this.model.query(init))
          .startAt(lastKey as any)
          .exec()
        let batchResult = queriedBatch.map((b) => mapTo<WhitelistChannel>(b))
        results.push(...batchResult)
        lastKey = queriedBatch.lastKey
      } while (lastKey)
      return results
    })
  }
}
