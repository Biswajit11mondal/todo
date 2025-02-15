import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { User, UserRoleEnum } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JWTClaim } from 'src/auth/dto/jwt-claim.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userPayload: CreateUserDto): Promise<User> {
    const checkUserExists = await this.prisma.user.findFirst({
      where: { email: userPayload.email },
    });
    if (checkUserExists) {
      throw new UnprocessableEntityException(
        'user already exists , please change the user email',
      );
    }

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

  async getAllUser(
    pageNumber: number,
    pageSize: number,
  ): Promise<{
    items: User[];
    metadata: {
      count: number;
      noOfPages: number;
      currentPage: number;
    };
  }> {
    const page = Number(pageNumber) || 1;
    const size = Number(pageSize) || 5;

    const skip = (pageNumber - 1) * pageSize;

    const count = await this.prisma.user.count();

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
    const tasks = await this.prisma.user.findMany({
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
    // const user: User[] = await this.prisma.user.findMany();
    // return user;
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

  async getFilterUser(
    name: string,
    pageNumber: number,
    pageSize: number,
  ): Promise<{
    items: User[];
    metadata: {
      count: number;
      noOfPages: number;
      currentPage: number;
    };
  }> {
    const page = Number(pageNumber) || 1;
    const size = Number(pageSize) || 5;

    const skip = (pageNumber - 1) * pageSize;

    const count = await this.prisma.user.count({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
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
    const user = await this.prisma.user.findMany({
      skip: page,
      take: size,
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    console.log({ user });

    return {
      items: user,
      metadata: {
        count,
        noOfPages,
        currentPage: pageNumber ?? 1,
      },
    };
  }
}
