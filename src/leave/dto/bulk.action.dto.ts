import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
export class BulkAction {
    @ApiProperty()
    @IsNotEmpty()
    ids: string[];
  }
  
  