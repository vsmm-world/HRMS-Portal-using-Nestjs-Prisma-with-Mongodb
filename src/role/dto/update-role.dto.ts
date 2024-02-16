import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, isNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  name?: string;

  @ApiProperty()
  @IsNotEmpty()
  permissions?: string[];
}
