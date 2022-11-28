import { EventRuleEvent } from '@pulumi/aws/cloudwatch'
import { mapTo, createUserModel, MessageBus } from '@joystream/ytube'
import { setAwsConfig, User, UserIngestionTriggered } from '@youtube-sync/domain'

export async function orphanUsersChecker(event: EventRuleEvent) {
  // Set AWS config in case we are running locally
  setAwsConfig()

  const users = await createUserModel().query({ partition: 'users' }).filter('channelsCount').eq(0).exec()
  console.log(users)
  const events = users.map((u) => mapTo<User>(u)).map((u) => new UserIngestionTriggered(u, Date.now()))
  await new MessageBus().publishAll(events, 'userEvents')
}
