import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import * as postmark from 'postmark';
import { env } from 'process';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeaveDto: CreateLeaveDto, req: any) {
    const { user } = req;
    const chek = await this.prisma.user.findUnique({
      where: { id: user.id, isDeleted: false },
    });

    const leave = await this.prisma.leaveRequest.create({
      data: {
        ...createLeaveDto,
        userId: chek.id,
        status: 'pending',
      },
    });
    const client = new postmark.ServerClient(env.POST_MARK_API_KEY);
    const mail = {
      From: 'rushi@syscreations.com',
      Subject: `Leave Request from ${user.name}`,
      To: 'rvpc792@gmail.com',
      TextBody: `${user.name} requested for leave with leave id : ${leave.id}`,
    };
    await client.sendEmail(mail);
    // Send email notification to admin or appropriate user role

    return leave;
  }

  async findAll() {
    return this.prisma.leaveRequest.findMany();
  }

  async findOne(id: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });
    if (!leave) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }
    return leave;
  }

  async update(id: string, updateLeaveDto: UpdateLeaveDto) {
    const existingLeave = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });
    if (!existingLeave) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }
    return this.prisma.leaveRequest.update({
      where: { id },
      data: updateLeaveDto,
    });
  }

  async remove(id: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });
    if (!leave) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }
    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }

  async approve(approvalDto, req: any) {
    const { id } = approvalDto;
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });
    if (!leave) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }
    // Implement approval logic here, such as updating the status to 'approved'
    const updatedLeave = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'approved' },
    });
    const user = await this.prisma.user.findFirst({
      where: { id: leave.userId, isDeleted: false },
    });
    const email = user.email;
    const client = new postmark.ServerClient(env.POST_MARK_API_KEY);
    const mail = {
      From: 'rushi@syscreations.com',
      Subject: 'Leave Request approved',
      To: user.email,
      TextBody: `Your Leave Request has been approved by your supervisor`,
    };
    await client.sendEmail(mail);
    return updatedLeave;
  }
  async reject(approvalDto, req: any) {
    const { id } = approvalDto;
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });
    if (!leave) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }
    // Implement approval logic here, such as updating the status to 'approved'
    const updatedLeave = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'rejected' },
    });
    const user = await this.prisma.user.findFirst({
      where: { id: leave.userId, isDeleted: false },
    });
    const email = user.email;
    const client = new postmark.ServerClient(env.POST_MARK_API_KEY);
    const mail = {
      From: 'rushi@syscreations.com',
      Subject: 'Leave Request Rejected',
      To: user.email,
      TextBody: `Your Leave Request has been rejected by your supervisor`,
    };
    await client.sendEmail(mail);

    return updatedLeave;
  }
}
