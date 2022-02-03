import { EventRuleEvent } from "@pulumi/aws/cloudwatch";
import { mapTo, userRepository, MessageBus } from "@joystream/ytube";
import { User, UserIngestionTriggered } from "@youtube-sync/domain";

export async function orphanUsersChecker(event: EventRuleEvent){
    console.log(event)
    const users = await userRepository().query({partition:'users'}).filter('channelsCount').eq(0).exec();
    console.log(users)
    const events = users
    .map(u => mapTo<User>(u))
    .map(u => new UserIngestionTriggered(u, Date.now()));
    await new MessageBus('eu-west-1').publishAll(events, 'userEvents');
}