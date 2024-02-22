import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class CommentOnLeaveDto {
  @ApiProperty()
  @IsNotEmpty()
  LeaveId: string;

  @ApiProperty()
  @IsNotEmpty()
  comment: string;
}
