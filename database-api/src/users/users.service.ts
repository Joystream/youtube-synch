import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}
  private readonly logger = new Logger(UsersService.name)

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOne(id);
  }

  async create(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async update(id: string, user: User): Promise<void> {
    await this.usersRepository.update({ id }, user);
  }
}