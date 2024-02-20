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
}

export class ApprovalDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}

export class BulkApprove {
  @ApiProperty()
  @IsNotEmpty()
  ids: string[];
}
