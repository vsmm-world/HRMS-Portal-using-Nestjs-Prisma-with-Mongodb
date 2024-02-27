import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import * as fs from 'fs';
import { EmployeeKeys } from 'src/shared/keys/employee.keys';
import { SalarySlipTemplate } from 'src/shared/template/salaryslip.template';
import { createObjectCsvWriter } from 'csv-writer';
import { Readable } from 'stream';
import { ChekAdmin } from 'src/shared/methods/check.admin';
import { ForbiddenResource } from 'src/shared/keys/forbidden.resource';
import { MailSender } from 'src/shared/methods/mailSender';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async genrateCSV(req) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
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

    return Buffer.concat(chunks);
  }

  async salary(req: any) {
    const { user } = req;

    const employee = await this.prisma.employee.findFirst({
      where: { userId: user.id, isDeleted: false },
    });

    if (!employee) {
      throw new NotFoundException();
    }

    async function generatePdf(employee: any, salary: any): Promise<void> {
      const data = {
        employee,
        salary,
      };

      const compiledTemplate = handlebars.compile(SalarySlipTemplate.template);

      const htmlContent = compiledTemplate(data);
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent);

      const pdfBuffer = await page.pdf({
        format: 'A4',
      });
      const fileName = `PDFFiles/EmployeeSalarySlip_${employee.firstName}_${Date.now()}.pdf`;
      fs.writeFileSync(fileName, pdfBuffer);
      console.log(`PDF saved as: ${fileName}`);
      await browser.close();

      const email = employee.email;
      const attachmentName = `EmployeeSalarySlip_${employee.firstName}_${Date.now()}.pdf`;
      const subject = 'Your Salary Slip';
      const message = `Please find your salary slip attached.`;

      return await MailSender.SendMailWithAttachment(
        email,
        attachmentName,
        pdfBuffer,
        subject,
        message,
      );
    }

    // Example usage:

    const salary = {
      basic: 5000,
      allowances: 1000,
      deductions: 500,
      netSalary: 5500,
    };

    generatePdf(employee, salary);
    return { message: EmployeeKeys.SlipGenerated };
  }
}
