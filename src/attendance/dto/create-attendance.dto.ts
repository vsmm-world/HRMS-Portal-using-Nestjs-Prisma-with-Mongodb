import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';



export class getAttendance {
  @ApiProperty()
  @IsNotEmpty()
  start_date: Date;
  @ApiProperty()
  @IsNotEmpty()
  end_date: Date;
}
