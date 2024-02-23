// mail.job.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { EmployeeService } from './employee.service';
import { ChekAdmin } from 'src/shared/methods/check.admin';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenResource } from 'src/shared/keys/forbidden.resource';
import { createObjectCsvWriter } from 'csv-writer';
import { Readable } from 'stream';
import { MailSender } from 'src/shared/methods/mailSender';
import { UserKeys } from 'src/shared/keys/user.keys';

@Processor('ravi')
export class MailJob {
  constructor(private prisma: PrismaService) {}

  @Process('sendMail')
  async sendMail(job: Job<{ userId: string }>) {
    console.log(`New job: ${job.id} processing`);
    const { userId } = job.data;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(UserKeys.NotFound);
    }

    const chekAdmin = await ChekAdmin.chekAdmin({ user }, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
    }

    const employees = await this.prisma.employee.findMany({});
    const csvWriter = createObjectCsvWriter({
      path: `CSVFiles/${Date.now()}_EmployeeDetails.csv`,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'department', title: 'Department' },
      ],
    });

    console.log(`New job: ${job.id} processing`);
    const records = employees.map((employee) => ({
      id: employee.id,
      name: employee.firstName,
      email: employee.email,
      department: employee.department,
    }));

    const outputStream = new Readable({
      read() {
        for (const record of records) {
          this.push(
            `${record.id},${record.name},${record.email},${record.department}\n`,
          );
        }
        this.push(null);
      },
    });

    const chunks: any[] = [];
    outputStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    await csvWriter.writeRecords(employees);

    const csvData = Buffer.concat(chunks);
    const fileName = `EmployeeDetails_${Date.now()}.csv`;
    const subject = 'Employee Details CSV';
    const message = 'Please find the employee details attached.';

    await MailSender.SendMailWithAttachment(
      user.email,
      fileName,
      csvData,
      subject,
      message,
    );
    console.log(`New job: ${job.id} processed`);
  }
}
