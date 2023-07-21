import { flags } from '@oclif/command'
import BN from 'bn.js'
import chalk from 'chalk'
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
    ...DefaultCommandBase.flags,
  }

  async run(): Promise<void> {
    const { rationale, joyPrice, payerMemberId } = this.parse(PayReward).flags

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

    await this.requireConfirmation('Do you confirm the reward payment for the channel?', false)

    for (const c of channels) {
      const signupReward = parseInt(c.sign_up_reward_in_usd || '0') / parseFloat(joyPrice)
      const referralReward = parseInt(c.latest_referral_reward_in_usd || '0') / parseFloat(joyPrice)
      const syncReward = parseInt(c.videos_sync_reward || '0') / parseFloat(joyPrice)
      const totalJoyReward = signupReward + referralReward + syncReward

      await this.joystreamCli.directChannelPayment({
        channelId: c.gleev_channel_id,
        amount: this.asHapi(totalJoyReward),
        rationale,
        payerMemberId,
      })

      // Update contact's reward status in Hubspot
      await updateYppContact(c.contactId, {
        latest_ypp_reward_status: 'Paid',
        latest_ypp_reward: totalJoyReward.toString(),
        total_ypp_rewards: new BN(c.total_ypp_rewards || 0).addn(totalJoyReward).toString(),
      })
    }

    this.log(chalk.green(`Successfully paid rewards to YPP channels !`))
  }
}
