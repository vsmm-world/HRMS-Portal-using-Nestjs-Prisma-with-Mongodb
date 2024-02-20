import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLeaveDto } from './create-leave.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { LeaveTypes } from './leave-types.enum';



export class UpdateLeaveDto {
  //create new enum for leaveType and implement it here
  @ApiProperty()
  @IsNotEmpty()
  leveType: LeaveTypes;
  

  @ApiProperty()
  @IsNotEmpty()
  startDate: Date;
  @ApiProperty()
  @IsNotEmpty()
  reason: string;
  @ApiProperty()
  @IsNotEmpty()
  endDate: Date;
}
