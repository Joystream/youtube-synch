import { Injectable } from '@nestjs/common';
import {User,UserCreated} from '@youtube-sync/domain'
import {
  mapTo,
  MessageBus,
  userRepository,
  IYoutubeClient,
  YtClient,
} from '@joystream/ytube';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UsersService {
  private _client: IYoutubeClient;
  private _bus: MessageBus;
  constructor(private configService: ConfigService) {
    this._client = YtClient.create(
      configService.get<string>('YOUTUBE_CLIENT_ID'),
      configService.get<string>('YOUTUBE_CLIENT_SECRET'),
      configService.get<string>('YOUTUBE_REDIRECT_URI')
    );
    this._bus = new MessageBus(configService.get<string>('AWS_REGION'));
  }
  async createFromCode(code: string): Promise<User> {
    const user = await this._client.getUserFromCode(code);
    const repo = userRepository();
    const existingUser = await repo.get({ partition: 'users', id: user.id });
    if (existingUser) 
      return user;
    const savedUser = await repo.update({ ...user, partition: 'users' });
    this._bus.publish(new UserCreated(user, Date.now()), 'userEvents');
    return mapTo<User>(savedUser);
  }
  async get(id: string): Promise<User> {
    const user = await userRepository().get({ partition: 'users', id: id });
    return mapTo<User>(user);
  }
  async find(search?: string): Promise<User[]> {
    const users = await userRepository()
      .query({ partition: 'users' })
      .and()
      .attribute('email')
      .contains(search)
      .exec();
    return users.map((u) => mapTo<User>(u));
  }
}
