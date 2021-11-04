import { Controller, Get, Param, ParseUUIDPipe, Post, Body, Delete, Put, ParseIntPipe } from '@nestjs/common';

import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  public async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(":id")
  public async find(@Param("id", ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Post()
  public async create(@Body() user: User): Promise<User> {
    return this.usersService.create(user);
  }

  @Delete(':id')
  public async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.usersService.delete(id);
  }

  @Put(':id')
  public async update(@Param('id', ParseUUIDPipe) id: string, @Body() user: User): Promise<void> {
    this.usersService.update(id, user);
  }
}
