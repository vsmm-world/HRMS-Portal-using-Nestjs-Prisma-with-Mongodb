import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BullModule } from '@nestjs/bull'; // Add this line
import { MailJob } from './mail.job';

@Module({
  imports: [
    PrismaModule,

    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  controllers: [EmployeeController],
  providers: [MailJob, EmployeeService],
})
export class EmployeeModule {}
