import Command, { flags } from '@oclif/command'
import { getContactsToPay } from '../../hubspot'
import { displayTable } from '../utils/display'

export default class GetRewardsOwed extends Command {
  static description = `Pays reward to all Verified channels for the latest reward cycle`

  static flags = {
    joyPrice: flags.string({
      required: true,
      description: 'Price of JOY token',
      char: 'p',
    }),
  }

  async run(): Promise<void> {
    const { joyPrice } = this.parse(GetRewardsOwed).flags

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
      console.log(`No channels to pay rewards to`)
    }
  }
}
