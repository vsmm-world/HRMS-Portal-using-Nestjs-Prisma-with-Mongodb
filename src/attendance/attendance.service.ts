import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Import PrismaService for database interaction
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceRecord } from '.prisma/client'; // Import Prisma-generated AttendanceRecord type

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto, req: any) {
    const { user } = req;
    await this.prisma.attendanceRecord.create({
      data: {
        userId: user.id,
        ...createAttendanceDto,
      },
    });
  }

  async findAll() {
    return this.prisma.attendanceRecord.findMany();
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
    return this.prisma.attendanceRecord.delete({
      where: { id },
    });
  }
}
