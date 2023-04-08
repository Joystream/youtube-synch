import AsyncLock from 'async-lock'
import * as dynamoose from 'dynamoose'
import { ConditionInitializer } from 'dynamoose/dist/Condition'
import { AnyItem } from 'dynamoose/dist/Item'
import { Query, Scan } from 'dynamoose/dist/ItemRetriever'
import { omit } from 'ramda'
import { DYNAMO_MODEL_OPTIONS, IRepository, mapTo } from '.'
import { ResourcePrefix, Stats } from '../types/youtube'

function statsRepository(tablePrefix: ResourcePrefix) {
  const schema = new dynamoose.Schema({
    partition: {
      type: String,
      hashKey: true,
    },
    date: {
      type: String,
      rangeKey: true,
    },
    syncQuotaUsed: Number,
    signupQuotaUsed: Number,
  })
  return dynamoose.model(`${tablePrefix}stats`, schema, DYNAMO_MODEL_OPTIONS)
}

export class StatsRepository implements IRepository<Stats> {
  private model

  // lock any updates on video table
  private readonly ASYNC_LOCK_ID = 'stat'
  private asyncLock: AsyncLock = new AsyncLock()

  constructor(tablePrefix: ResourcePrefix) {
    this.model = statsRepository(tablePrefix)
  }

  async getModel() {
    return this.model
  }

  async getOrSetTodaysStats(): Promise<Stats> {
    // Quota resets at Pacific Time, and pst is 8 hours behind UTC
    const today = new Date().toLocaleDateString('en-US', {
      timeZone: 'America/Los_Angeles',
      dateStyle: 'full',
    })

    // Get today's stats
    let stats = await this.get(today)

    if (!stats) {
      const statsDoc = await this.model.update({
        partition: 'stats',
        date: today,
        syncQuotaUsed: 0,
        signupQuotaUsed: 0,
      })
      stats = mapTo<Stats>(statsDoc)
    }

    return stats
  }

  async upsertAll(): Promise<Stats[]> {
    throw new Error('Not implemented')
  }

  async scan(init: ConditionInitializer, f: (q: Scan<AnyItem>) => Scan<AnyItem>): Promise<Stats[]> {
    return this.asyncLock.acquire(this.ASYNC_LOCK_ID, async () => {
      const results = await f(this.model.scan(init)).exec()
      return results.map((r) => mapTo<Stats>(r))
    })
  }

  async get(date: string): Promise<Stats | undefined> {
    return this.asyncLock.acquire(this.ASYNC_LOCK_ID, async () => {
      const result = await this.model.get({ partition: 'stats', date })
      return result ? mapTo<Stats>(result) : undefined
    })
  }

  async save(model: Stats): Promise<Stats> {
    return this.asyncLock.acquire(this.ASYNC_LOCK_ID, async () => {
      const update = omit(['id', 'updatedAt'], model)
      const result = await this.model.update({ partition: 'stats', date: model.date }, update)
      return mapTo<Stats>(result)
    })
  }

  async delete(id: string): Promise<void> {
    throw Error('Deleting Youtube Quota stats is not implemented')
  }

  async query(init: ConditionInitializer, f: (q: Query<AnyItem>) => Query<AnyItem>) {
    return this.asyncLock.acquire(this.ASYNC_LOCK_ID, async () => {
      const results = await f(this.model.query(init)).exec()
      return results.map((r) => mapTo<Stats>(r))
    })
  }
}
