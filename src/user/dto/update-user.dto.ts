import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name: string;  
}
