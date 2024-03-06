import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class ReplyOnCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  LeaveId: string;
  @ApiProperty()
  @IsNotEmpty()
  CommentId: string;

  @ApiProperty()
  @IsNotEmpty()
  reply: string;
}
