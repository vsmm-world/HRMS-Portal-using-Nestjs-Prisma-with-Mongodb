import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import * as fs from 'fs';
import * as postmark from 'postmark';
import { env } from 'process';
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
      // Load your HTML template
      const template = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta http-equiv="Content-Style-Type" content="text/css" />
        <title>Employee Salary Slip</title>
        <style type="text/css">
          body {
            font-family: 'Arial', sans-serif;
            font-size: 12pt;
            margin: 0;
            padding: 0;
            background-color: #f0f0f0; /* Light Grey Background */
          }
      
          .container {
            width: 80%;
            margin: 20px auto;
            background-color: #ffffff; /* White Container */
            padding: 20px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
          }
      
          h1 {
            color: #333; /* Dark Text Color */
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
      
          p {
            margin: 0;
            line-height: 1.5;
          }
      
          .user-details {
            margin-top: 20px;
          }
      
          .salary-details {
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Employee Salary Slip</h1>
      
          <div class="user-details">
            <p><span>First Name:</span> {{employee.firstName}}</p>
            <p><span>Last Name:</span> {{employee.lastName}}</p>
            <p><span>Employee ID:</span> {{employee.id}}</p>
            <p><span>Email:</span> {{employee.email}}</p>
          </div>
      
          <div class="salary-details">
            <h2>Salary Details</h2>
            <p><span>Basic Salary:</span> {{salary.basic}}</p>
            <p><span>Allowances:</span> {{salary.allowances}}</p>
            <p><span>Deductions:</span> {{salary.deductions}}</p>
            <p><span>Net Salary:</span> {{salary.netSalary}}</p>
          </div>
        </div>
      </body>
      </html>
      
      `;

      const data = {
        employee,
        salary,
      };

      // Compile the template
      const compiledTemplate = handlebars.compile(template);

      // Provide data to the template
      const htmlContent = compiledTemplate(data);

      // Launch a headless browser
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // Set the HTML content of the page
      await page.setContent(htmlContent);

      // Generate PDF buffer
      const pdfBuffer = await page.pdf({
        format: 'A4',
      });

      // Save the PDF to a file
      const fileName = `PDFFiles/EmployeeSalarySlip_${employee.firstName}_${Date.now()}.pdf`;
      fs.writeFileSync(fileName, pdfBuffer);
      console.log(`PDF saved as: ${fileName}`);

      // Close the browser
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
    return { message: 'Successfully created Employee Salary Slip' };
  }
}
