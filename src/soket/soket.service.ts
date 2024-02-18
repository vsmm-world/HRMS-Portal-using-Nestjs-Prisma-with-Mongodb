import { Injectable } from '@nestjs/common';
import { CreateSoketDto } from './dto/create-soket.dto';
import { UpdateSoketDto } from './dto/update-soket.dto';

@Injectable()
export class SoketService {
  create(createSoketDto: CreateSoketDto) {
    return 'This action adds a new soket';
  }

  findAll() {
    return `This action returns all soket`;
  }

  findOne(id: number) {
    return `This action returns a #${id} soket`;
  }

  update(id: number, updateSoketDto: UpdateSoketDto) {
    return `This action updates a #${id} soket`;
  }

  remove(id: number) {
    return `This action removes a #${id} soket`;
  }
}
