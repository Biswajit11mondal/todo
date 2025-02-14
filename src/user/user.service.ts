import { Injectable } from '@nestjs/common';
import { User, UserRoleEnum } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userPayload: CreateUserDto): Promise<User> {
    console.log('Received Payload:', userPayload);
    const user: User = await this.prisma.user.create({
      data: {
        ...userPayload,
        role: UserRoleEnum.Member,
      },
    });

    return user;
  }

  async getUser(id: string): Promise<User> {
    const user: User = await this.prisma.user.findFirst({ where: { id } });
    return user;
  }

  async getAllUser(): Promise<User[]> {
    const user: User[] = await this.prisma.user.findMany();
    return user;
  }

  async updateUser(
    id: string,
    updatedDataPayload: UpdateUserDto,
  ): Promise<User> {
    const user = await this.getUser(id);
    const updatedUserData = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: updatedDataPayload.name,
      },
    });
    return updatedUserData;
  }

  async deleteUser(id: string) {
    const user = await this.getUser(id);
    await this.prisma.user.delete({
      where: { id: user.id },
    });
    return {
      success: true,
    };
  }
}
