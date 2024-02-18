import { ApiProperty, PartialType } from '@nestjs/swagger';

export class UpdateAttendanceDto {
  @ApiProperty()
  checkIn?: Date;

  @ApiProperty()
  checkOut?: Date;
}
