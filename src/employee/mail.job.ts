import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ChekAdmin } from 'src/shared/methods/check.admin';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenResource } from 'src/shared/keys/forbidden.resource';
import { createObjectCsvWriter } from 'csv-writer';
import { Readable } from 'stream';
import { MailSender } from 'src/shared/methods/mailSender';
import { UserKeys } from 'src/shared/keys/user.keys';
import puppeteer from 'puppeteer';
import { SalarySlipTemplate } from 'src/shared/template/salaryslip.template';
import { EmployeeKeys } from 'src/shared/keys/employee.keys';

@Processor('mail')
export class MailJob {
  constructor(private prisma: PrismaService) {}

  @Process('sendCSV')
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

    const employees = await this.prisma.employee.findMany({
      where: { isDeleted: false },
    });
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
    const subject = EmployeeKeys.CSVMailSubject;
    const message = EmployeeKeys.MailMessage;

    await MailSender.SendMailWithAttachment(
      user.email,
      fileName,
      csvData,
      subject,
      message,
    );
  }
  @Process('sendPDF')
  async sendEmailWithPdf(job: Job<{ userId: string }>) {
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
    const employeeData = employees.map((employee) => ({
      id: employee.id,
      name: employee.firstName,
      email: employee.email,
      department: employee.department,
    }));

    const pdfBuffer = await this.generatePDF(employeeData);

    const fileName = `EmployeeDetails_${Date.now()}.pdf`;
    const subject = EmployeeKeys.PDFMailSubject;
    const message = EmployeeKeys.MailMessage;
    await MailSender.SendMailWithAttachment(
      user.email,
      fileName,
      pdfBuffer,
      subject,
      message,
    );
  }

  async generatePDF(employeeData: any[]) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlContent = this.constructHTML(employeeData);
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdfBuffer;
  }
  constructHTML(employeeData: any[]) {
    let html = SalarySlipTemplate.employeeTemplate;
    employeeData.forEach((employee) => {
      html += `
            <tr>
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.email}</td>
                <td>${employee.department}</td>
            </tr>`;
    });
    html += `
            </table>
        </body>
        </html>`;

    return html;
  }
}
