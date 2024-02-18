import { Module } from '@nestjs/common';
import { SoketService } from './soket.service';
import { SoketGateway } from './soket.gateway';

@Module({
  providers: [SoketGateway, SoketService],
})
export class SoketModule {}
