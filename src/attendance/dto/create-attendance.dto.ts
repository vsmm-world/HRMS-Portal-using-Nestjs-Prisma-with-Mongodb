import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty()
  @IsNotEmpty()
  checkIn: Date;

  @ApiProperty()
  @IsNotEmpty()
  checkOut?: Date;
}
