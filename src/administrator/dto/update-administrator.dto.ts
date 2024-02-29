import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { CustomEmailValidator } from 'src/validator/custom-validator';

export class UpdateAdministratorDto {
  @ApiProperty({ required: false })
  userId?: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ required: false })
  @Validate(CustomEmailValidator, {
    message: 'Invalid email format (e.g. example@test.com )',
  })
  email?: string;

  @ApiProperty({ required: false })
  department?: string;

  @ApiProperty({ required: false })
  jobTitle?: string;

  @ApiProperty({ required: false })
  contactInfo?: string;
}
