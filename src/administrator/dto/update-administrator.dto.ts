import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { CustomEmailValidator } from 'src/validator/custom-validator';

export class UpdateAdministratorDto {
  @ApiProperty()
  userId?: string;

  @ApiProperty()
  firstName?: string;

  @ApiProperty()
  lastName?: string;

  @ApiProperty()
  @Validate(CustomEmailValidator, {
    message: 'Invalid email format (e.g. example@test.com )',
  })
  email?: string;

  @ApiProperty()
  department?: string;

  @ApiProperty()
  jobTitle?: string;
  
  @ApiProperty()
  contactInfo?: string;
}
