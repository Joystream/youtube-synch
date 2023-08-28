import { flags } from '@oclif/command'
import BN from 'bn.js'
import chalk from 'chalk'
import _ from 'lodash'
import { getContactsToPay, updateYppContacts } from '../../hubspot'
import { PayContactsInput, RevertPayingContactsInput } from '../../types'
import DefaultCommandBase from '../base/default'

let preventShutdown = false
process.on('SIGINT', () => {
  if (preventShutdown) {
    console.log('Caught interrupt signal. Ignoring...')
  } else {
    process.exit(1)
  }
})

/**
 * * The batch payment command/script is designed to be close to an atomic operation.
 * * It first update the contact's reward status in Hubspot to "Paid", then
 * * make the actual payment using directChannelPayment CLI command, if payment
 * * fails, it revert the contact's reward status in Hubspot to "To Pay"
 */
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

  async run(): Promise<void> {
    const { rationale, joyPrice, payerMemberId, batchSize } = this.parse(PayReward).flags
    if (batchSize < 1 || batchSize > 100) {
      this._help()
    }

    const channels = (await getContactsToPay()).filter(
      (c) => c.sign_up_reward_in_usd !== '0' || c.latest_referral_reward_in_usd !== '0' || c.videos_sync_reward !== '0'
    )
    if (!channels.length) {
      this.log(`No channels to pay rewards to`)
      return
    }

    await this.requireConfirmation(`Do you confirm the payment for ${chalk.green(channels.length)} channels?`, false)

    // Get controller account of the payer member
    const account = await this.getJoystreamMemberControllerAccount(payerMemberId)

    const channelsBatches = _.chunk(channels, batchSize)
    for (const channelsBatch of channelsBatches) {
      // prepare owed payment params
      const payments = channelsBatch.map((c) => {
        const signupReward = parseInt(c.sign_up_reward_in_usd || '0') / parseFloat(joyPrice)
        const referralReward = parseInt(c.latest_referral_reward_in_usd || '0') / parseFloat(joyPrice)
        const syncReward = parseInt(c.videos_sync_reward || '0') / parseFloat(joyPrice)
        const totalJoyReward = signupReward + referralReward + syncReward
        return { channelId: c.gleev_channel_id, joyAmount: totalJoyReward }
      })

      // Get nonce of the payer account (Getting nonce before updating the
      // Hubspot contacts, because if done otherwise there might be a case
      // that the Hubspot contacts are updated (i.e. set as "Paid") but then
      // `getAccountNonce` operation errors, which we don't want.
      const currentNonce = await this.getAccountNonce(account)

      // prepare params for updating contact's reward status fields in Hubspot
      const updateContactsRewardsInput: PayContactsInput = channelsBatch.map((c, i) => ({
        id: c.contactId,
        properties: {
          latest_ypp_reward_status: 'Paid',
          latest_ypp_reward: payments[i].joyAmount.toString(),
          total_ypp_rewards: new BN(c.total_ypp_rewards || 0).addn(payments[i].joyAmount).toString(),
        },
      }))
      // update contact's reward status in Hubspot to paid before making the payment
      await updateYppContacts(updateContactsRewardsInput)

      try {
        // make payments in batch transaction
        preventShutdown = true
        await this.joystreamCli.directChannelPayment({
          payments: payments.map((p) => ({ ...p, amount: this.asHapi(p.joyAmount) })),
          rationale,
          payerMemberId,
        })
      } catch (err) {
        const newNonce = await this.getAccountNonce(account)
        if (newNonce === currentNonce) {
          // Means the payment transaction was not successful, so
          // revert the contacts reward status in Hubspot to "To Pay"
          const revertContactsRewardsInput: RevertPayingContactsInput = channelsBatch.map((c) => ({
            id: c.contactId,
            properties: {
              latest_ypp_reward_status: 'To Pay',
              sign_up_reward_in_usd: c.sign_up_reward_in_usd,
              latest_referral_reward_in_usd: c.latest_referral_reward_in_usd,
              videos_sync_reward: c.videos_sync_reward,
              latest_ypp_reward: c.latest_ypp_reward,
              total_ypp_rewards: c.total_ypp_rewards,
            },
          }))
          await updateYppContacts(revertContactsRewardsInput)
        }

        // If the payment was cancelled by the user, then don't pay any more channels
        if (err instanceof Error && err.message.includes('"exitSignal":"SIGINT"')) {
          throw err
        }
      } finally {
        preventShutdown = false
      }
    }

    this.log(chalk.green(`Successfully paid rewards to YPP channels!`))
  }
}
