import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateLeaveDto {
  @ApiProperty()
  @IsNotEmpty()
  startDate: Date;
  @ApiProperty()
  @IsNotEmpty()
  reason: string;
  @ApiProperty()
  @IsNotEmpty()
  endDate: Date;
  @ApiProperty({ required: false })
  @IsNotEmpty()
  alsoNotify: Array<string>;
}
