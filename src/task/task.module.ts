import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [TaskService, UserService],
  controllers: [TaskController]
})
export class TaskModule {}
