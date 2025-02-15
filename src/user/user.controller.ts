import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserRoleEnum } from '@prisma/client';
import { Authorized, AuthorizedClaim } from 'src/auth/guards/role-guard';
import { JwtAuthGuard } from 'src/auth/strategies/jwt.strategy';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
@ApiTags('user')
@ApiBearerAuth('jwt')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Authorized(JwtAuthGuard, UserRoleEnum.Admin)
  @Post()
  @ApiOperation({
    summary: 'create user ',
  })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() userPayload: CreateUserDto): Promise<User> {
    return await this.userService.createUser(userPayload);
  }

  @Authorized(JwtAuthGuard)
  @Get('/:id')
  async getUser(@Param('id') id: string): Promise<User> {
    return await this.userService.getUser(id);
  }

  @Authorized(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'All user ',
  })
  @ApiQuery({
    name: 'pageNumber',
    required: false,
    description: 'Optional page number for pagination (default is 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Optional page size for pagination (default is 5)',
  })
  async getAllUser(
    @Query('pageNumber') pageNumber?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<{
    items: User[];
    metadata: {
      count: number;
      noOfPages: number;
      currentPage: number;
    };
  }> {
    return await this.userService.getAllUser(pageNumber, pageSize);
  }

  @Authorized(JwtAuthGuard, UserRoleEnum.Admin)
  @Put('/:id')
  @ApiBody({ type: UpdateUserDto })
  async updateUser(
    @Param('id') id: string,
    @Body() updatedDataPayload: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.updateUser(id, updatedDataPayload);
  }

  @Authorized(JwtAuthGuard, UserRoleEnum.Admin)
  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }

  @Authorized(JwtAuthGuard)
  @Get('/filter/:name')
  @ApiOperation({
    summary: 'filter user',
  })
  @ApiQuery({
    name: 'pageNumber',
    required: false,
    description: 'Optional page number for pagination (default is 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Optional page size for pagination (default is 5)',
  })
  async getFilterUser(
    @Param('name') name: string,
    @Query('pageNumber') pageNumber?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<{
    items: User[];
    metadata: {
      count: number;
      noOfPages: number;
      currentPage: number;
    };
  }> {
    return await this.userService.getFilterUser(name, pageNumber, pageSize);
  }
}
