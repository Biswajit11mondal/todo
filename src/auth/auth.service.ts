import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { signinUserDto } from './dto/signin-user.dto';
import { User, UserRoleEnum } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { JWTClaim } from './dto/jwt-claim.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signinUser(payload: signinUserDto): Promise<User> {
    const user: User = await this.prisma.user.findFirst({
      where: { email: payload.username },
    });

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    if (payload.password !== user.password)
      throw new BadRequestException(
        'Please verify your password and try again.',
      );

    return user;
  }

  async generateAccessToken(user: User) {
    const tokenPayload: JWTClaim = {
      id: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(tokenPayload),
    };
  }
}
