import { EventRuleEvent } from "@pulumi/aws/cloudwatch";
import { mapTo, UserIngestionTriggered, userRepository, User, MessageBus } from "../../ytube/src";

export async function orphanUsersChecker(event: EventRuleEvent){
    const users = await userRepository().query({partition:'users'}).filter('channelsCount').eq(0).exec();
    const events = users
    .map(u => mapTo<User>(u))
    .map(u => new UserIngestionTriggered(u, Date.now()));
    await new MessageBus('eu-west-1').publishAll(events, 'userEvents');
}