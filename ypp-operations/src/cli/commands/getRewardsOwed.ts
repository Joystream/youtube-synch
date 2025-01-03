import Command, { flags } from '@oclif/command'
import { getContactsToPay } from '../../hubspot'
import { displayTable } from '../utils/display'

export default class GetRewardsOwed extends Command {
  static description = `Display information about outstanding (owed) YPP rewards.`

  static flags = {
    joyPrice: flags.string({
      required: true,
      description: 'Price of JOY token',
      char: 'p',
    }),
    format: flags.enum({
      description: 'Reward currency format',
      char: 'f',
      options: ['usd', 'joy']
    })
  }

  async run(): Promise<void> {
    const { joyPrice, format } = this.parse(GetRewardsOwed).flags

    const channels = (await getContactsToPay()).filter(
      (c) => c.sign_up_reward_in_usd !== '0' || c.latest_referral_reward_in_usd !== '0' || c.videos_sync_reward !== '0'
    )

    const formatAsJoy = (rewardUsd: number) =>
      (rewardUsd / parseFloat(joyPrice))
        .toLocaleString('en-US', { maximumFractionDigits: 0 })
        .padStart(9, ' ')
        + ' JOY'
    const formatAsUsd = (rewardUsd: number) => `${rewardUsd.toLocaleString('en-US').padStart(4, ' ')}` + ' USD'
    const formatReward = (rewardUsd: number) => format === 'joy' ? formatAsJoy(rewardUsd) : formatAsUsd(rewardUsd)
    let totalSignupRewardsUsd = 0
    let totalReferralRewardsUsd = 0
    let totalSyncRewardsUsd = 0
    let totalAllRewardsUsd = 0
    if (channels.length > 0) {
      displayTable(
        channels.map((c) => {
          const signupRewardUsd = parseInt(c.sign_up_reward_in_usd || '0')
          const referralRewardUsd = parseInt(c.latest_referral_reward_in_usd || '0')
          const syncRewardUsd = parseInt(c.videos_sync_reward || '0')
          const totalRewardUsd = signupRewardUsd + referralRewardUsd + syncRewardUsd
          totalSignupRewardsUsd += signupRewardUsd
          totalReferralRewardsUsd += referralRewardUsd
          totalSyncRewardsUsd += syncRewardUsd
          totalAllRewardsUsd += totalRewardUsd
          return {
            'Youtube Channel ID': c.channel_url,
            'Gleev Channel ID': c.gleev_channel_id,
            'Tier': c.yppstatus || 'Unknown',
            'Signup Rewards': formatReward(signupRewardUsd),
            'Referral Rewards': formatReward(referralRewardUsd),
            'Sync Rewards': formatReward(syncRewardUsd),
            'Total Rewards': formatReward(totalRewardUsd),
          }
        }),
        3
      )
      console.log("")
      displayTable(
        [{
          'Total singup rewards': formatReward(totalSignupRewardsUsd),
          'Total sync rewards': formatReward(totalSyncRewardsUsd),
          'Total referral rewards': formatReward(totalReferralRewardsUsd),
          'Total all rewards:': formatReward(totalAllRewardsUsd)
        }],
        3
      )
    } else {
      console.log(`No channels to pay rewards to`)
    }
  }
}
