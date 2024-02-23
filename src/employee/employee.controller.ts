import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@ApiTags('Employees')
@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    @InjectQueue('ravi') private mailQueue: Queue,
  ) {}

  @Get('salarySlip')
  salary(@Request() req) {
    return this.employeeService.salary(req);
  }

  @Get('genrateCSV')
  async genrateCSV(@Request() req) {
    const userId = req.user.id;
     const data = await this.mailQueue.add('sendMail',{
      userId,
    });
    return { data };
  }
}
