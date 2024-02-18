import { Test, TestingModule } from '@nestjs/testing';
import { SoketService } from './soket.service';

describe('SoketService', () => {
  let service: SoketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoketService],
    }).compile();

    service = module.get<SoketService>(SoketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
