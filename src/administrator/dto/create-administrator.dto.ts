import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Validate } from 'class-validator';
import { CustomEmailValidator } from 'src/validator/custom-validator';

export class CreateAdministratorDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: string;
  @ApiProperty()
  @IsNotEmpty()
  firstName: string;
  @ApiProperty()
  @IsNotEmpty()
  lastName: string;
  @ApiProperty()
  @IsNotEmpty()
  @Validate(CustomEmailValidator, {
    message: 'Invalid email format (e.g. example@test.com )',
  })
  email: string;
  @ApiProperty()
  @IsNotEmpty()
  department: string;
  @ApiProperty()
  @IsNotEmpty()
  jobTitle: string;
  @ApiProperty()
  @IsNotEmpty()
  contactInfo: string;
}
