import { UsersRepository } from '@joystream/ytube'
import { Injectable } from '@nestjs/common'
import { User } from '@youtube-sync/domain'

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  /**
   * @param userId
   * @returns Returns user
   */
  async get(userId: string): Promise<User> {
    const result = await this.usersRepository.get(userId)
    if (!result) {
      throw new Error(`Could not find user with id ${userId}`)
    }
    return result
  }

  async usersByEmail(search: string): Promise<User[]> {
    // find users with given email
    const result = await this.usersRepository.scan('id', (q) =>
      search ? q.and().attribute('email').contains(search) : q
    )
    return result
  }

  /**
   * @param user
   * @returns Updated user
   */
  async save(user: User): Promise<User> {
    return this.usersRepository.save(user)
  }
}
