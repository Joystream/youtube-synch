import AsyncLock from 'async-lock'
import * as dynamoose from 'dynamoose'
import { ConditionInitializer } from 'dynamoose/dist/Condition'
import { AnyItem } from 'dynamoose/dist/Item'
import { Query, QueryResponse, Scan, ScanResponse } from 'dynamoose/dist/ItemRetriever'
import { omit } from 'ramda'
import { DYNAMO_MODEL_OPTIONS, IRepository, mapTo } from '.'
import { ResourcePrefix, YtUser } from '../types/youtube'

function createUserModel(tablePrefix: ResourcePrefix) {
  const userSchema = new dynamoose.Schema(
    {
      id: {
        type: String,
        hashKey: true,
      },

      // User email
      email: String,

      // User youtube username
      youtubeUsername: String,

      // User Google ID
      googleId: String,

      // user authorization code
      authorizationCode: String,

      // user access token obtained from authorization code after successful authentication
      accessToken: String,

      // user refresh token that will be used to get new access token after expiration
      refreshToken: String,

      // User avatar url
      avatarUrl: String,

      // Corresponding Joystream member ID/s for Youtube user created through `POST /membership` (if any)
      joystreamMemberIds: {
        type: Array,
        schema: [Number],
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
        updatedAt: {
          updatedAt: {
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
  return dynamoose.model(`${tablePrefix}users`, userSchema, DYNAMO_MODEL_OPTIONS)
}

export class UsersRepository implements IRepository<YtUser> {
  private model

  // lock any updates on video table
  private readonly ASYNC_LOCK_ID = 'user'
  private asyncLock: AsyncLock = new AsyncLock({ maxPending: Number.MAX_SAFE_INTEGER })
  private useLock: boolean // Flag to determine if locking should be used

  constructor(tablePrefix: ResourcePrefix, useLock: boolean = true) {
    this.model = createUserModel(tablePrefix)
    this.useLock = useLock
  }

  private async withLock<T>(func: () => Promise<T>): Promise<T> {
    if (this.useLock) {
      return this.asyncLock.acquire(this.ASYNC_LOCK_ID, func)
    } else {
      return func()
    }
  }

  async upsertAll(users: YtUser[]): Promise<YtUser[]> {
    const results = await Promise.all(users.map(async (user) => this.save(user)))
    return results
  }

  async scan(init: ConditionInitializer, f: (q: Scan<AnyItem>) => Scan<AnyItem>): Promise<YtUser[]> {
    return this.withLock(async () => {
      let lastKey = undefined
      const results = []
      do {
        let scannedBatch: ScanResponse<AnyItem> = await f(this.model.scan(init))
          .startAt(lastKey as any)
          .exec()
        let batchResult = scannedBatch.map((b) => mapTo<YtUser>(b))
        results.push(...batchResult)
        lastKey = scannedBatch.lastKey
      } while (lastKey)
      return results
    })
  }

  async get(id: string): Promise<YtUser | undefined> {
    return this.withLock(async () => {
      const result = await this.model.get({ id })
      return result ? mapTo<YtUser>(result) : undefined
    })
  }

  async save(user: YtUser): Promise<YtUser> {
    return this.withLock(async () => {
      const update = omit(['id', 'updatedAt'], user)
      const result = await this.model.update({ id: user.id }, update)
      return mapTo<YtUser>(result)
    })
  }

  async delete(id: string): Promise<void> {
    return this.withLock(async () => {
      await this.model.delete({ id })
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
        let batchResult = queriedBatch.map((b) => mapTo<YtUser>(b))
        results.push(...batchResult)
        lastKey = queriedBatch.lastKey
      } while (lastKey)
      return results
    })
  }
}

export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  /**
   * @param userId
   * @returns Returns user
   */
  async get(userId: string): Promise<YtUser> {
    const result = await this.usersRepository.get(userId)
    if (!result) {
      throw new Error(`Could not find user with id ${userId}`)
    }
    return result
  }

  async usersByEmail(search: string): Promise<YtUser[]> {
    // find users with given email
    const result = await this.usersRepository.scan('id', (q) =>
      search ? q.and().attribute('email').contains(search) : q
    )
    return result
  }

  /**
   * @param user
   * @returns Updated user
   */
  async save(user: YtUser): Promise<YtUser> {
    return this.usersRepository.save(user)
  }
}
