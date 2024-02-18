import { PartialType } from '@nestjs/mapped-types';
import { CreateSoketDto } from './create-soket.dto';

export class UpdateSoketDto extends PartialType(CreateSoketDto) {
  id: number;
}
