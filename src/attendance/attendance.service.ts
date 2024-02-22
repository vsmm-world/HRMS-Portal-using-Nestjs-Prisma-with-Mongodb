import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Import PrismaService for database interaction
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { getAttendance } from './dto/create-attendance.dto';
import { ChekAdmin } from 'src/shared/methods/check.admin';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async chekOut(req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException("You don't have permission");
    }
    const { user } = req;
    const attendanceRecord = await this.prisma.attendanceRecord.findFirst({
      where: {
        userId: user.id,
        checkOut: null,
      },
    });
    if (!attendanceRecord) {
      throw new NotFoundException('You have already checked out.');
    }
    return this.prisma.attendanceRecord.update({
      where: { id: attendanceRecord.id },
      data: {
        checkOut: new Date(Date.now()),
      },
    });
  }
  async chekIn(req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException("You don't have permission");
    }
    const { user } = req;
    return this.prisma.attendanceRecord.create({
      data: {
        userId: user.id,
        checkIn: new Date(Date.now()),
        checkOut: null,
      },
    });
  }
  async findAll(req: any) {
    const { user } = req;
    return this.prisma.attendanceRecord.findMany({ where: { id: user.id } });
  }

  async findOne(id: string) {
    const attendance = await this.prisma.attendanceRecord.findUnique({
      where: { id },
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
    return attendance;
  }
  getAttendanceByTimeDuration(getAttendance: getAttendance, req: any) {
    const { user } = req;
    return this.prisma.attendanceRecord.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: getAttendance.start_date,
          lte: getAttendance.end_date,
        },
      },
    });
  }
  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    const existingAttendance = await this.prisma.attendanceRecord.findUnique({
      where: { id },
    });
    if (!existingAttendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
    return this.prisma.attendanceRecord.update({
      where: { id },
      data: updateAttendanceDto,
    });
  }

  async remove(id: string) {
    const attendance = await this.prisma.attendanceRecord.findUnique({
      where: { id },
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
    return this.prisma.attendanceRecord.update({
      where: { id: attendance.id },
      data: {
        isDeleted: true,
      },
    });
  }
}
