// update-user.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import {
  CustomEmailValidator,
  PasswordValidator,
} from 'src/validator/custom-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  @Validate(CustomEmailValidator, {
    message: 'Invalid email format (e.g. example@test.com )',
  })
  email?: string;
}
