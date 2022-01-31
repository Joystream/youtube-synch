import { EventRuleEvent } from "@pulumi/aws/cloudwatch";
import { mapTo, UserIngestionTriggered, userRepository, User, MessageBus } from "@joystream/ytube";

export async function orphanUsersChecker(event: EventRuleEvent){
    console.log(event)
    const users = await userRepository().query({partition:'users'}).filter('channelsCount').eq(0).exec();
    console.log(users)
    const events = users
    .map(u => mapTo<User>(u))
    .map(u => new UserIngestionTriggered(u, Date.now()));
    await new MessageBus('eu-west-1').publishAll(events, 'userEvents');
}