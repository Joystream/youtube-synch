import { ConditionInitializer } from 'dynamoose/dist/Condition'
import { DeepPartial } from 'dynamoose/dist/General'
import { AnyItem } from 'dynamoose/dist/Item'
import { Query, Scan } from 'dynamoose/dist/ItemRetriever'
import { TableOptions } from 'dynamoose/dist/Table'
export * from './user'
export * from './video'
export * from './channel'
export * from './stats'
export * from './DynamodbService'

// Schemas defined here are only for modeling purpose and not for creating tables itself,
// as Pulumi is responsible all sort of infrastructure provisioning and deployment.
export const DYNAMO_MODEL_OPTIONS: DeepPartial<TableOptions> = { create: false }

export function mapTo<TEntity>(doc: AnyItem) {
  return doc.serialize() as TEntity
}

export interface IRepository<T> {
  get(partition: string, id: string): Promise<T | undefined>
  save(model: T, partition: string): Promise<T>
  delete(partition: string, id: string): Promise<void>
  query(init: ConditionInitializer, f: (q: Query<AnyItem>) => Query<AnyItem>): Promise<T[]>
  scan(init: ConditionInitializer, f: (q: Scan<AnyItem>) => Scan<AnyItem>): Promise<T[]>
  upsertAll(items: T[]): Promise<T[]>
}
