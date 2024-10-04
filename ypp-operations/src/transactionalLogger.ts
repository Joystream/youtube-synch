import loki from 'lokijs'
import pkgDir from 'pkg-dir'
import { PayContactsInput } from './types'

const collectionName = 'transactions'

interface TransactionLog {
  transactionId: number // transaction nonce
  paymentDetails: PayContactsInput
  // the block number when this transaction log was created. Note: the block number
  // when the transaction was submitted might be different (i.e. higher)
  currentBlockNo: number
  timestamp: string
}

export class PaymentTransactionLogger {
  private static instance: PaymentTransactionLogger | null = null
  private db: loki

  private constructor() {
    this.db = new loki(`${pkgDir.sync(__dirname)}/transactionLogDB.json`, {
      env: 'NODEJS',
      persistenceMethod: 'fs',
    })
  }

  private async saveDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.saveDatabase((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  private async loadDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.loadDatabase({}, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  public async clear() {
    const transactions = this.db.getCollection<TransactionLog>(collectionName)
    if (transactions) {
      transactions.clear()
      await this.saveDatabase()
    }
  }

  public static async create(): Promise<PaymentTransactionLogger> {
    if (PaymentTransactionLogger.instance === null) {
      const logger = new PaymentTransactionLogger()
      await logger.loadDatabase()
      let transactions = logger.db.getCollection(collectionName)
      if (transactions === null) {
        logger.db.addCollection<TransactionLog>(collectionName, { indices: 'transactionId' })
      }

      PaymentTransactionLogger.instance = logger
    }

    return PaymentTransactionLogger.instance
  }

  public async createTransactionLog(
    transactionId: number,
    paymentDetails: PayContactsInput,
    currentBlockNo: number
  ): Promise<void> {
    const transactions = this.db.getCollection<TransactionLog>(collectionName)
    if (transactions) {
      const newLogEntry: TransactionLog = {
        transactionId,
        paymentDetails,
        currentBlockNo,
        timestamp: new Date().toISOString(),
      }
      transactions.insert(newLogEntry)
      await this.saveDatabase()
    }
  }

  public async getByTransactionId(transactionId: number): Promise<TransactionLog | null> {
    const transactions = this.db.getCollection<TransactionLog>(collectionName)
    const txLog = transactions.data.find((t) => t.transactionId === transactionId)
    return txLog || null
  }
}
