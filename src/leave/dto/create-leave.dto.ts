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
  @ApiProperty()
  @IsNotEmpty()
  alsoNotify: Array<string>;
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

export class CommentOnLeaveDto {
  @ApiProperty()
  @IsNotEmpty()
  LeaveId: string;

  @ApiProperty()
  @IsNotEmpty()
  comment: string;
}
