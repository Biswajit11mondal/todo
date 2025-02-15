import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { signinUserDto } from './dto/signin-user.dto';
import { User, UserRoleEnum } from '@prisma/client';
import { JWTClaim } from './dto/jwt-claim.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
    role: UserRoleEnum.Admin,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockToken = 'mock-access-token';

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signinUser', () => {
    it('should return a user if credentials are valid', async () => {
      const signinPayload: signinUserDto = {
        username: 'john.doe@example.com',
        password: 'password',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.signinUser(signinPayload);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: signinPayload.username },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if user does not exist', async () => {
      const signinPayload: signinUserDto = {
        username: 'nonexistent@example.com',
        password: 'password',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.signinUser(signinPayload)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: signinPayload.username },
      });
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      const signinPayload: signinUserDto = {
        username: 'john.doe@example.com',
        password: 'wrong-password',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.signinUser(signinPayload)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: signinPayload.username },
      });
    });
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', async () => {
      const tokenPayload: JWTClaim = {
        id: mockUser.id,
        role: mockUser.role,
      };

      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.generateAccessToken(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith(tokenPayload);
      expect(result).toEqual({ access_token: mockToken });
    });
  });
});
