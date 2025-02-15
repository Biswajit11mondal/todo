import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEnum } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'mail is required' })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Role of the user',
    enum: UserRoleEnum,
    example: UserRoleEnum.Admin,
  })
  @IsNotEmpty({ message: 'User role is required' })
  @IsEnum(UserRoleEnum, {
    message: 'Invalid user role, enum contain Admin, Member',
  })
  role: UserRoleEnum;
}
