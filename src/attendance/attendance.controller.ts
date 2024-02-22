import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  CreateAttendanceDto,
  getAttendance,
} from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('chekIn')
  chekIn(@Request() req) {
    return this.attendanceService.chekIn(req);
  }
  @Post('chekOut')
  chekOut(@Request() req) {
    return this.attendanceService.chekOut(req);
  }

  @Get()
  findAll(@Request() req) {
    return this.attendanceService.findAll(req);
  }

  @Get(':attendanceId')
  findOne(@Param('attendanceId') attendanceId: string) {
    return this.attendanceService.findOne(attendanceId);
  }

  @Get('getAttendanceByTimeDuration')
  getAttendanceByTimeDuration(
    @Request() req,
    @Body() getAttendance: getAttendance,
  ) {
    return this.attendanceService.getAttendanceByTimeDuration(
      getAttendance,
      req,
    );
  }

  @Patch(':attendanceId')
  update(
    @Param('attendanceId') attendanceId: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(attendanceId, updateAttendanceDto);
  }

  @Delete(':attendanceId')
  remove(@Param('attendanceId') attendanceId: string) {
    return this.attendanceService.remove(attendanceId);
  }
}
