import { flags } from '@oclif/command'
import BN from 'bn.js'
import chalk from 'chalk'
import _ from 'lodash'
import { getContactsToPay, updateYppContact } from '../../hubspot'
import DefaultCommandBase from '../base/default'
import { displayTable } from '../utils/display'

export default class PayReward extends DefaultCommandBase {
  static description = `Pays reward to all Verified channels for the latest reward cycle`

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
      description: 'Number of channels to pay rewards to in a single transaction',
      default: 1,
      char: 'b',
    }),
    ...DefaultCommandBase.flags,
  }

  async run(): Promise<void> {
    const { rationale, joyPrice, payerMemberId, batchSize } = this.parse(PayReward).flags

    const channels = (await getContactsToPay()).filter(
      (c) => c.sign_up_reward_in_usd !== '0' || c.latest_referral_reward_in_usd !== '0' || c.videos_sync_reward !== '0'
    )

    if (channels.length > 0) {
      displayTable(
        channels.map((c) => {
          const signupReward = parseInt(c.sign_up_reward_in_usd || '0') / parseFloat(joyPrice)
          const referralReward = parseInt(c.latest_referral_reward_in_usd || '0') / parseFloat(joyPrice)
          const syncReward = parseInt(c.videos_sync_reward || '0') / parseFloat(joyPrice)
          const totalJoyReward = signupReward + referralReward + syncReward
          return {
            'Youtube Channel ID': c.channel_url,
            'Gleev Channel ID': c.gleev_channel_id,
            'Signup Rewards in (JOY)': signupReward,
            'Referral Rewards (JOY)': referralReward,
            'Sync Rewards (JOY)': syncReward,
            'Latest Total Rewards (JOY)': totalJoyReward,
          }
        }),
        3
      )
    } else {
      this.log(`No channels to pay rewards to`)
    }

    await this.requireConfirmation('Do you confirm the reward payment for the channels?', false)

    const batches = _.chunk(channels, batchSize)
    for (const batch of batches) {
      // prepare owed payment params
      const expectedPayments = batch.map((c) => {
        const signupReward = parseInt(c.sign_up_reward_in_usd || '0') / parseFloat(joyPrice)
        const referralReward = parseInt(c.latest_referral_reward_in_usd || '0') / parseFloat(joyPrice)
        const syncReward = parseInt(c.videos_sync_reward || '0') / parseFloat(joyPrice)
        const totalJoyReward = signupReward + referralReward + syncReward
        return { channelId: c.gleev_channel_id, amount: this.asHapi(totalJoyReward) }
      })

      const channelsPaid = (await this.wal.read()).getState().channels || []
      const payments = expectedPayments.filter((c) => !channelsPaid.includes(c.channelId))

      // make payments in batch transaction
      if (payments.length) {
        await this.joystreamCli.directChannelPayment({
          payments,
          rationale,
          payerMemberId,
        })
      }

      await this.wal.setState({ channels: batch.map((c) => c.gleev_channel_id) }).write()

      for (const [i, c] of batch.entries()) {
        // Update contact's reward status in Hubspot
        await updateYppContact(c.contactId, {
          latest_ypp_reward_status: 'Paid',
          latest_ypp_reward: expectedPayments[i].amount.toString(),
          total_ypp_rewards: new BN(c.total_ypp_rewards || 0).addn(Number(expectedPayments[i].amount)).toString(),
        })
      }
      await this.wal.setState({ channels: [] }).write()
    }

    this.log(chalk.green(`Successfully paid rewards to YPP channels !`))
  }
}
