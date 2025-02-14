import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userPayload: CreateUserDto): Promise<User> {
    console.log('Received Payload:', userPayload);
    const user: User = await this.prisma.user.create({
      data: {
        ...userPayload,
      },
    });

    return user;
  }

  async getUser(id: string): Promise<User> {
    const user: User = await this.prisma.user.findFirst({ where: { id } });
    return user;
  }
}
