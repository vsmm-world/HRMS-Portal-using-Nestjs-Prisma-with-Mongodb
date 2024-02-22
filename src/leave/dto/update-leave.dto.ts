import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLeaveDto } from './create-leave.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { LeaveTypes } from './leave-types.enum';

export class UpdateLeaveDto {
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  reason: string;
  @ApiProperty()
  endDate: Date;
}
