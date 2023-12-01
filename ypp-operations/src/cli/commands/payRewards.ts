import { flags } from '@oclif/command'
import BN from 'bn.js'
import chalk from 'chalk'
import _ from 'lodash'
import { getContactsToPay, updateYppContacts } from '../../hubspot'
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
    for (const [i, channelsBatch] of channelsBatches.entries()) {
      // prepare owed payment params
      const payments = channelsBatch.map((c) => {
        const signupReward = parseInt(c.sign_up_reward_in_usd || '0') / parseFloat(joyPrice)
        const referralReward = parseInt(c.latest_referral_reward_in_usd || '0') / parseFloat(joyPrice)
        const syncReward = parseInt(c.videos_sync_reward || '0') / parseFloat(joyPrice)
        const totalJoyReward = signupReward + referralReward + syncReward
        return { channelId: c.gleev_channel_id, joyAmount: totalJoyReward }
      })

      // prepare params for updating contact's reward status fields in Hubspot
      const updateContactsRewardsInput: PayContactsInput = channelsBatch.map((c, i) => ({
        id: c.contactId,
        properties: {
          latest_ypp_reward_status: 'Paid',
          latest_ypp_reward: payments[i].joyAmount.toString(),
          total_ypp_rewards: new BN(c.total_ypp_rewards || 0).addn(payments[i].joyAmount).toString(),
        },
      }))

      const currentNonce = await this.getAccountNonce(account)

      try {
        // make payments in batch transaction
        await this.joystreamCli.directChannelPayment({
          payments: payments.map((p) => ({ ...p, amount: this.asHapi(p.joyAmount) })),
          rationale,
          payerMemberId,
        })
      } finally {
        const newNonce = await this.getAccountNonce(account)
        if (newNonce === currentNonce + 1) {
          // update contact's reward status in Hubspot to paid before making the payment
          await updateYppContacts(updateContactsRewardsInput)
          this.log(
            chalk.greenBright(`Done paying rewards to ${chalk.yellow(i * batchSize + channelsBatch.length)} channels!`)
          )
        }
      }
    }
  }
}
