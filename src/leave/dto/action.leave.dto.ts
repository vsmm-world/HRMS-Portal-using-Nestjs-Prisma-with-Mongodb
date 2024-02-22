import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ApprovalDto {
    @ApiProperty()
    @IsNotEmpty()
    id: string;
  }