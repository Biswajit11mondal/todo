import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { PriorityStatusEnum, StatusEnum, Task } from '@prisma/client';
import { Authorized, AuthorizedClaim } from 'src/auth/guards/role-guard';
import { JwtAuthGuard } from 'src/auth/strategies/jwt.strategy';
import { JWTClaim } from 'src/auth/dto/jwt-claim.dto';

@Controller('task')
@ApiTags('task')
@ApiBearerAuth('jwt')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Authorized(JwtAuthGuard)
  @Post()
  @ApiBody({ type: CreateTaskDto })
  async createTask(
    @Body() taskPayload: CreateTaskDto,
    @AuthorizedClaim() claim: JWTClaim,
  ): Promise<Task> {
    return await this.taskService.createTask(taskPayload, claim);
  }

  @Authorized(JwtAuthGuard)
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
  @Get()
  async getAllTask(
    @Query('pageNumber') pageNumber?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<{
    items: Task[];
    metadata: {
      count: number;
      noOfPages: number;
      currentPage: number;
    };
  }> {
    return await this.taskService.getAllTask(pageNumber, pageSize);
  }

  @Authorized(JwtAuthGuard)
  @Put('/assign-task/:taskId/:userId')
  async assignTask(
    @Param('userId') userId: string,
    @Param('taskId') taskId: string,
  ): Promise<Task> {
    return await this.taskService.assignTask(userId, taskId);
  }

  @Authorized(JwtAuthGuard)
  @Put('/change-task-priority/:taskId')
  @ApiQuery({
    name: 'priority',
    enum: PriorityStatusEnum,
    description:
      'The priority status of the task is "Low" | "High" | "Medium" ',
  })
  async changeTaskPriority(
    @Param('taskId') taskId: string,
    @Query('priority') priority: PriorityStatusEnum,
  ): Promise<Task> {
    return await this.taskService.changeTaskPriority(taskId, priority);
  }

  @Authorized(JwtAuthGuard)
  @Put('/change-task-status/:taskId')
  @ApiQuery({
    name: 'status',
    enum: StatusEnum,
    description: 'The status of the task is "Open" | "InProgress" | "closed" ',
  })
  async changeTaskStatus(
    @Param('taskId') taskId: string,
    @Query('status') status: StatusEnum,
  ): Promise<Task> {
    return await this.taskService.changeTaskStatus(taskId, status);
  }

  @Authorized(JwtAuthGuard)
  @Get('/filter')
  @ApiOperation({
    summary: 'filter task',
    description: 'filter task by his status and priority ',
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
  @ApiQuery({
    name: 'status',
    enum: StatusEnum,
    description: 'The status of the task is "Open" | "InProgress" | "closed" ',
  })
  @ApiQuery({
    name: 'priority',
    enum: PriorityStatusEnum,
    description:
      'The priority status of the task is "Low" | "High" | "Medium" ',
  })
  async getFilterTask(
    @Query('status') status: StatusEnum,
    @Query('priority') priority: PriorityStatusEnum,
    @Query('pageNumber') pageNumber?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<{
    items: Task[];
    metadata: {
      count: number;
      noOfPages: number;
      currentPage: number;
    };
  }> {
    return await this.taskService.getFilterTask(
      status,
      priority,
      pageNumber,
      pageSize,
    );
  }

  @Authorized(JwtAuthGuard)
  @Get('/filter/:userId')
  @ApiOperation({
    summary: 'filter task by userId',
    description: 'filter task by his status and priority for a assigned user ',
  })
  @ApiQuery({
    name: 'status',
    enum: StatusEnum,
    description: 'The status of the task is "Open" | "InProgress" | "closed" ',
  })
  @ApiQuery({
    name: 'priority',
    enum: PriorityStatusEnum,
    description:
      'The priority status of the task is "Low" | "High" | "Medium" ',
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
  async getFilterTaskForAUser(
    @Param('userId') userId: string,
    @Query('status') status: StatusEnum,
    @Query('priority') priority: PriorityStatusEnum,
    @Query('pageNumber') pageNumber?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<{
    items: Task[];
    metadata: {
      count: number;
      noOfPages: number;
      currentPage: number;
    };
  }> {
    return await this.taskService.getFilterTaskForAUser(
      status,
      priority,
      userId,
      pageNumber,
      pageSize,
    );
  }

  @Authorized(JwtAuthGuard)
  @Get('/:id')
  async getTask(@Param('id') id: string): Promise<Task> {
    console.log(' from task by id');

    return await this.taskService.getTask(id);
  }

  @Authorized(JwtAuthGuard)
  @Put('/change-task-description/:taskId')
  @ApiQuery({
    name: 'description',
    type: String,
    description: 'task description ',
  })
  async changeTaskDescription(
    @Param('taskId') taskId: string,
    @Query('description') description: string,
  ): Promise<Task> {
    return await this.taskService.changeTaskDescription(taskId, description);
  }

  @Authorized(JwtAuthGuard)
  @Delete('/delete-task/:taskId')
  async taskDeletion(@Param('taskId') taskId: string) {
    return await this.taskService.taskDeletion(taskId);
  }
}
