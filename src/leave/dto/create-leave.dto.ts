import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateLeaveDto {
  @ApiProperty()
  @IsNotEmpty()
  leaveType: string;
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

export class ApprovalDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  status: string;
}
