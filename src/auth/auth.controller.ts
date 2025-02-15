import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signinUserDto } from './dto/signin-user.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './strategies/local.strategy';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: signinUserDto })
  @UseGuards(LocalAuthGuard)
  @Post('user/signin')
  @ApiOperation({
    summary: 'user signin',
    description: 'user can sign in using this',
  })
  async signin(@Req() req) {
    return await this.authService.generateAccessToken(req.user);
  }
}
