import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { JWTClaim } from '../dto/jwt-claim.dto';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'It is a secret phrase',
    });
  }

  async validate(claim: JWTClaim): Promise<JWTClaim> {
    const user = await this.prisma.user.findFirst({ where: { id: claim.id } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return claim;
  }
}
