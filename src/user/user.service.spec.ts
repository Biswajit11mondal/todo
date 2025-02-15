import { Test, TestingModule } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRoleEnum } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
    role: UserRoleEnum.Admin,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password',
        role: UserRoleEnum.Admin,
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.createUser(createUserDto);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw UnprocessableEntityException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password',
        role: UserRoleEnum.Admin,
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('getUser', () => {
    it('should return a user by id', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.getUser('1');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('getAllUser', () => {
    it('should return paginated users', async () => {
      const pageNumber = 1; // Ensure pageNumber is 1
      const pageSize = 5;
      const count = 10; // Ensure count is greater than pageSize
      const noOfPages = Math.ceil(count / pageSize);

      mockPrismaService.user.count.mockResolvedValue(count);
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.getAllUser(pageNumber, pageSize);

      expect(prisma.user.count).toHaveBeenCalled();
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        skip: 1, // skip = 0
        take: pageSize, // take = 5
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual({
        items: [mockUser],
        metadata: {
          count,
          noOfPages,
          currentPage: pageNumber,
        },
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Jane Doe',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        name: 'Jane Doe',
      });

      const result = await service.updateUser('1', updateUserDto);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Jane Doe' },
      });
      expect(result).toEqual({
        ...mockUser,
        name: 'Jane Doe',
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.deleteUser('1');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual({ success: true });
    });
  });
});
