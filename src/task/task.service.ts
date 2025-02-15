import { BadRequestException, Injectable } from '@nestjs/common';
import { PriorityStatusEnum, StatusEnum, Task } from '@prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JWTClaim } from 'src/auth/dto/jwt-claim.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async createTask(taskPayload: CreateTaskDto, claim: JWTClaim): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        ...taskPayload,
        priority: PriorityStatusEnum.Medium,
        status: StatusEnum.Open,
        createdBy: claim.id,
      },
    });
    return task;
  }

  public async getTask(taskId: string): Promise<Task> {
    const task = await this.prisma.task.findFirst({ where: { id: taskId } });

    if (!task) {
      throw new BadRequestException('please provide a valid task id');
    }

    return task;
  }

  async getAllTask(
    pageNumber: number,
    pageSize: number,
  ): Promise<{
    items: Task[];
    metadata: {
      count: number;
      noOfPages: number;
      currentPage: number;
    };
  }> {
    const page = Number(pageNumber) || 1;
    const size = Number(pageSize) || 5;

    const skip = (pageNumber - 1) * pageSize;

    const count = await this.prisma.task.count();

    const noOfPages = Math.ceil(count / size);
    if (size > count || page > noOfPages) {
      return {
        items: [],
        metadata: {
          count,
          noOfPages,
          currentPage: pageNumber,
        },
      };
    }
    const tasks = await this.prisma.task.findMany({
      skip: page,
      take: size,
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      items: tasks,
      metadata: {
        count,
        noOfPages,
        currentPage: pageNumber ?? 1,
      },
    };
  }

  async assignTask(userId: string, taskId: string): Promise<Task> {
    const user = await this.userService.getUser(userId);
    if (!user) {
      throw new BadRequestException('please provide a valid userId');
    }

    const getTask = await this.getTask(taskId);
    if (!getTask) {
      throw new BadRequestException('please provide a valid task id');
    }

    const task = await this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        assigned_to: userId,
      },
    });

    return task;
  }

  async changeTaskPriority(
    taskId: string,
    priority: PriorityStatusEnum,
  ): Promise<Task> {
    const getTask = await this.getTask(taskId);
    if (!getTask) {
      throw new BadRequestException('please provide a valid task id');
    }
    const task = await this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        priority: priority,
      },
    });

    return task;
  }

  async changeTaskStatus(taskId: string, status: StatusEnum): Promise<Task> {
    const getTask = await this.getTask(taskId);
    if (!getTask) {
      throw new BadRequestException('please provide a valid task id');
    }
    const task = await this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status,
      },
    });

    return task;
  }

  async getFilterTask(
    status: StatusEnum,
    priority: PriorityStatusEnum,
    pageNumber: number,
    pageSize: number,
  ): Promise<{
    items: Task[];
    metadata: {
      count: number;
      noOfPages: number;
      currentPage: number;
    };
  }> {
    const page = Number(pageNumber) || 1;
    const size = Number(pageSize) || 5;

    const skip = (pageNumber - 1) * pageSize;

    const count = await this.prisma.task.count({
      where: {
        status: status,
        priority: priority,
      },
    });

    const noOfPages = Math.ceil(count / size);
    if (size > count || page > noOfPages) {
      return {
        items: [],
        metadata: {
          count,
          noOfPages,
          currentPage: pageNumber,
        },
      };
    }
    const tasks = await this.prisma.task.findMany({
      skip: page,
      take: size,
      where: {
        status: status,
        priority: priority,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      items: tasks,
      metadata: {
        count,
        noOfPages,
        currentPage: pageNumber ?? 1,
      },
    };
  }

  async getFilterTaskForAUser(
    status: StatusEnum,
    priority: PriorityStatusEnum,
    userId: string,
    pageNumber: number,
    pageSize: number,
  ): Promise<{
    items: Task[];
    metadata: {
      count: number;
      noOfPages: number;
      currentPage: number;
    };
  }> {
    const user = await this.userService.getUser(userId);
    if (!user) {
      throw new BadRequestException('please provide a valid userId');
    }
    const page = Number(pageNumber) || 1;
    const size = Number(pageSize) || 5;

    const skip = (pageNumber - 1) * pageSize;

    const count = await this.prisma.task.count({
      where: {
        status: status,
        priority: priority,
      },
    });

    const noOfPages = Math.ceil(count / size);
    if (size > count || page > noOfPages) {
      return {
        items: [],
        metadata: {
          count,
          noOfPages,
          currentPage: pageNumber,
        },
      };
    }
    const tasks = await this.prisma.task.findMany({
      skip: page,
      take: size,
      where: {
        status: status,
        priority: priority,
        assigned_to: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      items: tasks,
      metadata: {
        count,
        noOfPages,
        currentPage: pageNumber ?? 1,
      },
    };
  }

  async changeTaskDescription(
    taskId: string,
    description: string,
  ): Promise<Task> {
    const getTask = await this.getTask(taskId);
    if (!getTask) {
      throw new BadRequestException('please provide a valid task id');
    }
    const task = await this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        description: description,
      },
    });

    return task;
  }

  async taskDeletion(taskId: string) {
    const getTask = await this.getTask(taskId);
    if (!getTask) {
      throw new BadRequestException('please provide a valid task id');
    }
    await this.prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return {
      success: true,
    };
  }
}
