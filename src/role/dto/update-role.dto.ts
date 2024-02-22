import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, isNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  permissions?: string[];
}
