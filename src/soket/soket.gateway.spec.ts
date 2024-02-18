import { Test, TestingModule } from '@nestjs/testing';
import { SoketGateway } from './soket.gateway';
import { SoketService } from './soket.service';

describe('SoketGateway', () => {
  let gateway: SoketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoketGateway, SoketService],
    }).compile();

    gateway = module.get<SoketGateway>(SoketGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
