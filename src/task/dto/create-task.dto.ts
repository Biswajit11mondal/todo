import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ type: Date })
  @IsNotEmpty()
  @IsString()
  dueDate: Date;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  assigned_to: string;
}
