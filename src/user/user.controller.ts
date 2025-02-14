import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserRoleEnum } from '@prisma/client';
import { Authorized } from 'src/auth/guards/role-guard';
import { JwtAuthGuard } from 'src/auth/strategies/jwt.strategy';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
@ApiTags('user')
@ApiBearerAuth('jwt')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Authorized(JwtAuthGuard, UserRoleEnum.Admin)
  @Post()
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() userPayload: CreateUserDto): Promise<User> {
    return await this.userService.createUser(userPayload);
  }

  @Authorized(JwtAuthGuard, UserRoleEnum.Admin)
  @Get('/:id')
  async getUser(@Param('id') id: string): Promise<User> {
    return await this.userService.getUser(id);
  }

  @Authorized(JwtAuthGuard, UserRoleEnum.Admin)
  @Get()
  async getAllUser(): Promise<User[]> {
    return await this.userService.getAllUser();
  }

  @Put('/:id')
  @ApiBody({ type: UpdateUserDto })
  async updateUser(
    @Param('id') id: string,
    @Body() updatedDataPayload: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.updateUser(id, updatedDataPayload);
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }
}
