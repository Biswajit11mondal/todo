import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { UserService } from '../user/user.service'; 
import { TaskService } from './task.service';
import { PriorityStatusEnum, StatusEnum, Task } from '@prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { JWTClaim } from 'src/auth/dto/jwt-claim.dto';

describe('TaskService', () => {
  let taskService: TaskService;
  let prismaService: PrismaService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: PrismaService,
          useValue: {
            task: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: UserService,
          useValue: {
            getUser: jest.fn(),
          },
        },
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
    prismaService = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(taskService).toBeDefined();
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      const taskPayload: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date(),
        assigned_to: null, // Add the missing required property
      };
      const claim: JWTClaim = {
        id: 'user-id',
        role: 'USER', // Add the missing required property
      };
      const createdTask: Task = {
        id: 'task-id',
        title: 'Test Task',
        description: 'Test Description',
        status: StatusEnum.Open,
        priority: PriorityStatusEnum.Medium,
        dueDate: new Date(),
        createdBy: 'user-id',
        assigned_to: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
  
      jest.spyOn(prismaService.task, 'create').mockResolvedValue(createdTask);
  
      const result = await taskService.createTask(taskPayload, claim);
  
      expect(result).toEqual(createdTask);
      expect(prismaService.task.create).toHaveBeenCalledWith({
        data: {
          ...taskPayload,
          priority: PriorityStatusEnum.Medium,
          status: StatusEnum.Open,
          createdBy: claim.id,
        },
      });
    });
  });

  describe('getTask', () => {
    it('should return a task if it exists', async () => {
      const taskId = 'task-id';
      const task: Task = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status: StatusEnum.Open,
        priority: PriorityStatusEnum.Medium,
        dueDate: new Date(),
        createdBy: 'user-id',
        assigned_to: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(prismaService.task, 'findFirst').mockResolvedValue(task);

      const result = await taskService.getTask(taskId);

      expect(result).toEqual(task);
      expect(prismaService.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId },
      });
    });

    it('should throw BadRequestException if task does not exist', async () => {
      const taskId = 'non-existent-task-id';

      jest.spyOn(prismaService.task, 'findFirst').mockResolvedValue(null);

      await expect(taskService.getTask(taskId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllTask', () => {
    // it('should return all tasks with pagination metadata', async () => {
    //   const pageNumber = 1;
    //   const pageSize = 5;
    //   const tasks: Task[] = [
    //     {
    //       id: 'task-id-1',
    //       title: 'Test Task 1',
    //       description: 'Test Description 1',
    //       status: StatusEnum.Open,
    //       priority: PriorityStatusEnum.Medium,
    //       dueDate: new Date(),
    //       createdBy: 'user-id',
    //       assigned_to: null,
    //       created_at: new Date(),
    //       updated_at: new Date(),
    //     },
    //     {
    //       id: 'task-id-2',
    //       title: 'Test Task 2',
    //       description: 'Test Description 2',
    //       status: StatusEnum.Open,
    //       priority: PriorityStatusEnum.Medium,
    //       dueDate: new Date(),
    //       createdBy: 'user-id',
    //       assigned_to: null,
    //       created_at: new Date(),
    //       updated_at: new Date(),
    //     },
    //   ];
    //   const count = 2;
    //   const noOfPages = 1;
    
    //   jest.spyOn(prismaService.task, 'count').mockResolvedValue(count);
    //   jest.spyOn(prismaService.task, 'findMany').mockResolvedValue(tasks);
    
    //   const result = await taskService.getAllTask(pageNumber, pageSize);
    
    //   expect(result).toEqual({
    //     items: tasks,
    //     metadata: {
    //       count,
    //       noOfPages,
    //       currentPage: pageNumber,
    //     },
    //   });
    //   expect(prismaService.task.count).toHaveBeenCalled();
    //   expect(prismaService.task.findMany).toHaveBeenCalledWith({
    //     skip: 0, 
    //     take: pageSize,
    //     orderBy: {
    //       created_at: 'desc',
    //     },
    //   });
    // });

    it('should return empty items if pageSize is greater than count', async () => {
      const pageNumber = 1;
      const pageSize = 5;
      const count = 2;
      const noOfPages = 1;

      jest.spyOn(prismaService.task, 'count').mockResolvedValue(count);
      jest.spyOn(prismaService.task, 'findMany').mockResolvedValue([]);

      const result = await taskService.getAllTask(pageNumber, pageSize);

      expect(result).toEqual({
        items: [],
        metadata: {
          count,
          noOfPages,
          currentPage: pageNumber,
        },
      });
    });
  });

  describe('assignTask', () => {
    it('should assign a task to a user', async () => {
      const userId = 'user-id';
      const taskId = 'task-id';
      const task: Task = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status: StatusEnum.Open,
        priority: PriorityStatusEnum.Medium,
        dueDate: new Date(),
        createdBy: 'user-id',
        assigned_to: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const updatedTask: Task = {
        ...task,
        assigned_to: userId,
      };
  
      // Mock the getUser method to return a full user object
      jest.spyOn(userService, 'getUser').mockResolvedValue({
        id: userId,
        created_at: new Date(),
        updated_at: new Date(),
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'USER',
      });
  
      jest.spyOn(taskService, 'getTask').mockResolvedValue(task);
      jest.spyOn(prismaService.task, 'update').mockResolvedValue(updatedTask);
  
      const result = await taskService.assignTask(userId, taskId);
  
      expect(result).toEqual(updatedTask);
      expect(prismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { assigned_to: userId },
      });
    });
  
    it('should throw BadRequestException if user does not exist', async () => {
      const userId = 'non-existent-user-id';
      const taskId = 'task-id';
  
      // Mock the getUser method to return null (user does not exist)
      jest.spyOn(userService, 'getUser').mockResolvedValue(null);
  
      await expect(taskService.assignTask(userId, taskId)).rejects.toThrow(
        BadRequestException,
      );
    });
  
    it('should throw BadRequestException if task does not exist', async () => {
      const userId = 'user-id';
      const taskId = 'non-existent-task-id';
  
      // Mock the getUser method to return a full user object
      jest.spyOn(userService, 'getUser').mockResolvedValue({
        id: userId,
        created_at: new Date(),
        updated_at: new Date(),
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'USER',
      });
  
      // Mock the getTask method to return null (task does not exist)
      jest.spyOn(taskService, 'getTask').mockResolvedValue(null);
  
      await expect(taskService.assignTask(userId, taskId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('changeTaskPriority', () => {
    it('should change the priority of a task', async () => {
      const taskId = 'task-id';
      const priority = PriorityStatusEnum.High;
      const task: Task = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status: StatusEnum.Open,
        priority: PriorityStatusEnum.Medium,
        dueDate: new Date(),
        createdBy: 'user-id',
        assigned_to: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const updatedTask: Task = {
        ...task,
        priority,
      };

      jest.spyOn(taskService, 'getTask').mockResolvedValue(task);
      jest.spyOn(prismaService.task, 'update').mockResolvedValue(updatedTask);

      const result = await taskService.changeTaskPriority(taskId, priority);

      expect(result).toEqual(updatedTask);
      expect(prismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { priority },
      });
    });

    it('should throw BadRequestException if task does not exist', async () => {
      const taskId = 'non-existent-task-id';
      const priority = PriorityStatusEnum.High;

      jest.spyOn(taskService, 'getTask').mockResolvedValue(null);

      await expect(
        taskService.changeTaskPriority(taskId, priority),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('changeTaskStatus', () => {
    it('should change the status of a task', async () => {
      const taskId = 'task-id';
      const status = StatusEnum.InProgress;
      const task: Task = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status: StatusEnum.Open,
        priority: PriorityStatusEnum.Medium,
        dueDate: new Date(),
        createdBy: 'user-id',
        assigned_to: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const updatedTask: Task = {
        ...task,
        status,
      };

      jest.spyOn(taskService, 'getTask').mockResolvedValue(task);
      jest.spyOn(prismaService.task, 'update').mockResolvedValue(updatedTask);

      const result = await taskService.changeTaskStatus(taskId, status);

      expect(result).toEqual(updatedTask);
      expect(prismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { status },
      });
    });

    it('should throw BadRequestException if task does not exist', async () => {
      const taskId = 'non-existent-task-id';
      const status = StatusEnum.InProgress;

      jest.spyOn(taskService, 'getTask').mockResolvedValue(null);

      await expect(
        taskService.changeTaskStatus(taskId, status),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getFilterTask', () => {
    // it('should return filtered tasks with pagination metadata', async () => {
    //   const status = StatusEnum.Open;
    //   const priority = PriorityStatusEnum.Medium;
    //   const pageNumber = 1;
    //   const pageSize = 5;
    //   const tasks: Task[] = [
    //     {
    //       id: 'task-id-1',
    //       title: 'Test Task 1',
    //       description: 'Test Description 1',
    //       status: StatusEnum.Open,
    //       priority: PriorityStatusEnum.Medium,
    //       dueDate: new Date(),
    //       createdBy: 'user-id',
    //       assigned_to: null,
    //       created_at: new Date(),
    //       updated_at: new Date(),
    //     },
    //     {
    //       id: 'task-id-2',
    //       title: 'Test Task 2',
    //       description: 'Test Description 2',
    //       status: StatusEnum.Open,
    //       priority: PriorityStatusEnum.Medium,
    //       dueDate: new Date(),
    //       createdBy: 'user-id',
    //       assigned_to: null,
    //       created_at: new Date(),
    //       updated_at: new Date(),
    //     },
    //   ];
    //   const count = 2;
    //   const noOfPages = 1;
    
    //   jest.spyOn(prismaService.task, 'count').mockResolvedValue(count);
    //   jest.spyOn(prismaService.task, 'findMany').mockResolvedValue(tasks);
    
    //   const result = await taskService.getFilterTask(
    //     status,
    //     priority,
    //     pageNumber,
    //     pageSize,
    //   );
    
    //   expect(result).toEqual({
    //     items: tasks,
    //     metadata: {
    //       count,
    //       noOfPages,
    //       currentPage: pageNumber,
    //     },
    //   });
    //   expect(prismaService.task.count).toHaveBeenCalledWith({
    //     where: { status, priority },
    //   });
    //   expect(prismaService.task.findMany).toHaveBeenCalledWith({
    //     skip: 0, // (pageNumber - 1) * pageSize = (1 - 1) * 5 = 0
    //     take: pageSize,
    //     where: { status, priority },
    //     orderBy: { created_at: 'desc' },
    //   });
    // });

    it('should return empty items if pageSize is greater than count', async () => {
      const status = StatusEnum.Open;
      const priority = PriorityStatusEnum.Medium;
      const pageNumber = 1;
      const pageSize = 5;
      const count = 2;
      const noOfPages = 1;

      jest.spyOn(prismaService.task, 'count').mockResolvedValue(count);
      jest.spyOn(prismaService.task, 'findMany').mockResolvedValue([]);

      const result = await taskService.getFilterTask(
        status,
        priority,
        pageNumber,
        pageSize,
      );

      expect(result).toEqual({
        items: [],
        metadata: {
          count,
          noOfPages,
          currentPage: pageNumber,
        },
      });
    });
  });

  describe('getFilterTaskForAUser', () => {
    // it('should return filtered tasks for a user with pagination metadata', async () => {
    //   const status = StatusEnum.Open;
    //   const priority = PriorityStatusEnum.Medium;
    //   const userId = 'user-id';
    //   const pageNumber = 1;
    //   const pageSize = 5;
    //   const tasks: Task[] = [
    //     {
    //       id: 'task-id-1',
    //       title: 'Test Task 1',
    //       description: 'Test Description 1',
    //       status: StatusEnum.Open,
    //       priority: PriorityStatusEnum.Medium,
    //       dueDate: new Date(),
    //       createdBy: 'user-id',
    //       assigned_to: userId,
    //       created_at: new Date(),
    //       updated_at: new Date(),
    //     },
    //     {
    //       id: 'task-id-2',
    //       title: 'Test Task 2',
    //       description: 'Test Description 2',
    //       status: StatusEnum.Open,
    //       priority: PriorityStatusEnum.Medium,
    //       dueDate: new Date(),
    //       createdBy: 'user-id',
    //       assigned_to: userId,
    //       created_at: new Date(),
    //       updated_at: new Date(),
    //     },
    //   ];
    //   const count = 2;
    //   const noOfPages = 1;
    
    //   jest.spyOn(userService, 'getUser').mockResolvedValue({
    //     id: userId,
    //     created_at: new Date(),
    //     updated_at: new Date(),
    //     name: 'Test User',
    //     email: 'test@example.com',
    //     password: 'hashedpassword',
    //     role: 'USER',
    //   });
    //   jest.spyOn(prismaService.task, 'count').mockResolvedValue(count);
    //   jest.spyOn(prismaService.task, 'findMany').mockResolvedValue(tasks);
    
    //   const result = await taskService.getFilterTaskForAUser(
    //     status,
    //     priority,
    //     userId,
    //     pageNumber,
    //     pageSize,
    //   );
    
    //   expect(result).toEqual({
    //     items: tasks,
    //     metadata: {
    //       count,
    //       noOfPages,
    //       currentPage: pageNumber,
    //     },
    //   });
    //   expect(prismaService.task.count).toHaveBeenCalledWith({
    //     where: { status, priority, assigned_to: userId },
    //   });
    //   expect(prismaService.task.findMany).toHaveBeenCalledWith({
    //     skip: 0, // (pageNumber - 1) * pageSize = (1 - 1) * 5 = 0
    //     take: pageSize,
    //     where: { status, priority, assigned_to: userId },
    //     orderBy: { created_at: 'desc' },
    //   });
    // });
  
    it('should throw BadRequestException if user does not exist', async () => {
      const status = StatusEnum.Open;
      const priority = PriorityStatusEnum.Medium;
      const userId = 'non-existent-user-id';
      const pageNumber = 1;
      const pageSize = 5;
  
      // Mock the getUser method to return null (user does not exist)
      jest.spyOn(userService, 'getUser').mockResolvedValue(null);
  
      await expect(
        taskService.getFilterTaskForAUser(
          status,
          priority,
          userId,
          pageNumber,
          pageSize,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('changeTaskDescription', () => {
    it('should change the description of a task', async () => {
      const taskId = 'task-id';
      const description = 'Updated Description';
      const task: Task = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status: StatusEnum.Open,
        priority: PriorityStatusEnum.Medium,
        dueDate: new Date(),
        createdBy: 'user-id',
        assigned_to: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const updatedTask: Task = {
        ...task,
        description,
      };

      jest.spyOn(taskService, 'getTask').mockResolvedValue(task);
      jest.spyOn(prismaService.task, 'update').mockResolvedValue(updatedTask);

      const result = await taskService.changeTaskDescription(taskId, description);

      expect(result).toEqual(updatedTask);
      expect(prismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { description },
      });
    });

    it('should throw BadRequestException if task does not exist', async () => {
      const taskId = 'non-existent-task-id';
      const description = 'Updated Description';

      jest.spyOn(taskService, 'getTask').mockResolvedValue(null);

      await expect(
        taskService.changeTaskDescription(taskId, description),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('taskDeletion', () => {
    it('should delete a task', async () => {
      const taskId = 'task-id';
      const task: Task = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status: StatusEnum.Open,
        priority: PriorityStatusEnum.Medium,
        dueDate: new Date(),
        createdBy: 'user-id',
        assigned_to: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(taskService, 'getTask').mockResolvedValue(task);
      jest.spyOn(prismaService.task, 'delete').mockResolvedValue(task);

      const result = await taskService.taskDeletion(taskId);

      expect(result).toEqual({ success: true });
      expect(prismaService.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
    });

    it('should throw BadRequestException if task does not exist', async () => {
      const taskId = 'non-existent-task-id';

      jest.spyOn(taskService, 'getTask').mockResolvedValue(null);

      await expect(taskService.taskDeletion(taskId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});