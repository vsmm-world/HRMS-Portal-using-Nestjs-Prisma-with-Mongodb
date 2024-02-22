import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import * as fs from 'fs';
import * as postmark from 'postmark';
import { env } from 'process';
import { EmployeeKeys } from 'src/shared/keys/employee.keys';
import { SalarySlipTemplate } from 'src/shared/template/salaryslip.template';
@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

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
      const client = new postmark.ServerClient(env.POST_MARK_API_KEY);

      let message = new postmark.Models.Message(
        'rushi@syscreations.com',
        'Your Salary Slip From HRMS Portal',
        'Find the attachment below',
        'Find the attachment below',
        `${user.email}`,
      );

      const attachment2 = new postmark.Models.Attachment(
        'SalarySlip.pdf',
        Buffer.from(pdfBuffer).toString('base64'),
        'application/pdf',
      );
      message.Attachments = [attachment2];

      client.sendEmail(message);
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
