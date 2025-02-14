import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() userPayload: CreateUserDto): Promise<User> {
    return await this.userService.createUser(userPayload);
  }

  @Get('/:id')
  async getUser(@Param('id') id: string): Promise<User> {
    return await this.userService.getUser(id);
  }

  @Get()
  async getAllUser(): Promise<User[]> {
    return await this.userService.getAllUser();
  }
}
