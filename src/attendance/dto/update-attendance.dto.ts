import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAttendanceDto } from './create-attendance.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateAttendanceDto {
  @ApiProperty()
  @IsNotEmpty()
  checkIn?: Date;

  @ApiProperty()
  @IsNotEmpty()
  checkOut?: Date;
}
