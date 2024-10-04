import { flags } from '@oclif/command'
import BN from 'bn.js'
import chalk from 'chalk'
import _ from 'lodash'
import { getContactsToPay, updateYppContacts } from '../../hubspot'
import { PaymentTransactionLogger } from '../../transactionalLogger'
import { PayContactsInput } from '../../types'
import DefaultCommandBase from '../base/default'

export default class PayReward extends DefaultCommandBase {
  static description = `Pays reward to all Verified YPP channels for the latest reward cycle based on the calculated rewards in hubspot`

  static flags = {
    rationale: flags.string({
      required: false,
      description: 'Reason why payment is being made',
      char: 'd',
    }),
    joyPrice: flags.string({
      required: true,
      description: 'Price of JOY token',
      char: 'p',
    }),
    batchSize: flags.integer({
      required: false,
      description: 'Number of channels to pay rewards to in a single transaction, should be a number b/w 1-100',
      default: 1,
      char: 'b',
    }),
    ...DefaultCommandBase.flags,
  }

  private txLogger: PaymentTransactionLogger

  async run(): Promise<void> {
    // Setup Transactional logger
    this.txLogger = await PaymentTransactionLogger.create()

    // Get CLI params
    const { rationale, joyPrice, payerMemberId, batchSize } = this.parse(PayReward).flags

    if (batchSize < 1 || batchSize > 100) {
      this._help()
    }

    // Get controller account of the payer member
    const account = await this.getJoystreamMemberControllerAccount(payerMemberId)

    // Ensure payment state consistency
    await this.ensurePaymentStateConsistency(account)

    // Get all channels/contacts that need to be paid
    const channels = await getContactsToPay()
    if (!channels.length) {
      this.log(`Found no channels to pay rewards to!`)
      return
    }

    await this.requireConfirmation(`Do you confirm the payment for ${chalk.green(channels.length)} channels?`, false)

    const channelsBatches = _.chunk(channels, batchSize)
    for (const [i, channelsBatch] of channelsBatches.entries()) {
      // prepare owed payment params
      const payments = channelsBatch.map((c) => {
        const signupReward = parseFloat(c.sign_up_reward_in_usd || '0') / parseFloat(joyPrice)
        const referralReward = parseFloat(c.latest_referral_reward_in_usd || '0') / parseFloat(joyPrice)
        const syncReward = parseFloat(c.videos_sync_reward || '0') / parseFloat(joyPrice)
        const totalJoyReward = signupReward + referralReward + syncReward
        return { channelId: c.gleev_channel_id, joyAmount: totalJoyReward }
      })

      // prepare params for updating contact's reward status fields in Hubspot
      const updateRewardsInput: PayContactsInput = channelsBatch.map((c, i) => ({
        id: c.contactId,
        properties: {
          latest_ypp_reward_status: 'Paid',
          latest_ypp_reward: payments[i].joyAmount.toString(),
          total_ypp_rewards: new BN(c.total_ypp_rewards || 0).addn(payments[i].joyAmount).toString(),
        },
      }))

      const [currentNonce, blockNo] = await Promise.all([this.getAccountNonce(account), this.getBestBlockNumber()])

      try {
        // create transaction log
        await this.txLogger.createTransactionLog(currentNonce, updateRewardsInput, blockNo)

        // make batch payment
        await this.joystreamCli.directChannelPayment({
          payments: payments.map((p) => ({ ...p, amount: this.asHapi(p.joyAmount) })),
          rationale,
          payerMemberId,
        })
      } finally {
        const newNonce = await this.getAccountNonce(account)

        // check if nonce has increased by 1  (means transaction was added in the block)
        if (newNonce === currentNonce + 1) {
          const txSucceeded = await this.getExtrinsicsStatusByNonceInRange(account, currentNonce, blockNo)

          // if submitted transaction was successful
          if (txSucceeded) {
            // update contact's reward status in Hubspot to paid
            await updateYppContacts(updateRewardsInput)
            this.log(
              chalk.greenBright(
                `Done paying rewards to ${chalk.yellow(i * batchSize + channelsBatch.length)} channels!`
              )
            )
          }
        }

        // clear tx log at the end of the successful payment
        await this.txLogger.clear()
      }
    }
  }

  async ensurePaymentStateConsistency(payerAccount: string) {
    // Get current nonce of the payer account
    const currentNonce = await this.getAccountNonce(payerAccount)

    // If the transaction log for `previous` nonce exists in the logs file, it means that the
    // previous payment transaction was added in the block, however it might have succeeded or
    // failed in the runtime.
    // So there are following possibilities and actions to take:
    // 1. The transaction was successful, but the hubspot update may or may not have succeeded.
    //    Nevertheless, we will update to contacts as paid in hubspot since this action will be
    //    idempotent.
    // 2. The transaction failed, and we wont do anything (skip updating hubspot).
    const txLog = await this.txLogger.getByTransactionId(currentNonce - 1)
    if (txLog) {
      const txSucceeded = await this.getExtrinsicsStatusByNonceInRange(
        payerAccount,
        txLog.transactionId, // previous nonce
        txLog.currentBlockNo
      )

      if (txSucceeded) {
        // Update contacts in hubspot
        await updateYppContacts(txLog.paymentDetails)
      }
    }

    // Clear the transaction log
    await this.txLogger.clear()
  }
}
