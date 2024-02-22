import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BullModule } from '@nestjs/bull';
import { MailJob } from './mail.job';

@Module({
  imports: [
    PrismaModule,
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService, MailJob],
})
export class EmployeeModule {}
