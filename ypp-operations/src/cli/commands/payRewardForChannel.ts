import { flags } from '@oclif/command'
import BN from 'bn.js'
import chalk from 'chalk'
import { getContactToPay, updateYppContact } from '../../hubspot'
import DefaultCommandBase from '../base/default'
import { displayCollapsedRow } from '../utils/display'

export default class PayReward extends DefaultCommandBase {
  static description = `Pays reward to all Verified channels for the latest reward cycle`

  static flags = {
    channelId: flags.string({
      required: true,
      description: 'Gleev channel Id',
      char: 'c',
    }),
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
    const { channelId, rationale, joyPrice, payerMemberId } = this.parse(PayReward).flags

    const channel = await getContactToPay(channelId)
    console.log(channel)
    const signupReward = parseInt(channel.sign_up_reward_in_usd || '0') / parseFloat(joyPrice)
    const referralReward = parseInt(channel.latest_referral_reward_in_usd || '0') / parseFloat(joyPrice)
    const syncReward = parseInt(channel.videos_sync_reward || '0') / parseFloat(joyPrice)
    const totalJoyReward = signupReward + referralReward + syncReward

    displayCollapsedRow({
      'Youtube Channel ID': channel.channel_url,
      'Gleev Channel ID': channel.gleev_channel_id,
      'Channel Email': channel.email,
      'Signup Rewards in (JOY)': signupReward,
      'Referral Rewards (JOY)': referralReward,
      'Sync Rewards (JOY)': syncReward,
      'Total Rewards (JOY)': totalJoyReward,
    })

    await this.requireConfirmation('Do you confirm the reward payment for the channel?', false)

    await this.joystreamCli.directChannelPayment({
      channelId: channel.gleev_channel_id,
      amount: this.asHapi(totalJoyReward),
      rationale,
      payerMemberId,
    })

    this.log(chalk.green(`Successfully paid rewards to YPP channel!`))

    // Update contact's reward status in Hubspot
    await updateYppContact(channel.contactId, {
      latest_ypp_reward_status: 'Paid',
      latest_ypp_reward: totalJoyReward.toString(),
      total_ypp_rewards: new BN(channel.total_ypp_rewards).addn(totalJoyReward).toString(),
    })

    this.log(chalk.green(`Successfully Updated Contact reward status in Hubspot!`))
  }
}
