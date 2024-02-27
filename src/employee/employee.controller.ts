import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FileTypeEnum } from './dto/file-type.enum';
import { EmployeeKeys } from 'src/shared/keys/employee.keys';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@ApiTags('Employees')
@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    @InjectQueue('mail') private mailQueue: Queue,
  ) {}

  @Get('salarySlip')
  salary(@Request() req) {
    return this.employeeService.salary(req);
  }

  @Get('genrate-employeelist-doc')
  @ApiQuery({ name: 'type', enum: FileTypeEnum })
  async genrateCSV(@Request() req, @Query('type') type: FileTypeEnum) {
    const userId = req.user.id;

    if (type == 'pdf') {
      await this.mailQueue.add('sendPDF', {
        userId,
      });
      return { statusCode: 200, message: EmployeeKeys.MailedSoon };
    }
    const data = await this.mailQueue.add('sendCSV', {
      userId,
    });
    return { statusCode: 200, message: EmployeeKeys.MailedSoon };
  }
}
