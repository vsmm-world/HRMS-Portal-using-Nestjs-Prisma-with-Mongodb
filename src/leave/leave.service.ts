import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BulkApprove,
  CommentOnLeaveDto,
  CreateLeaveDto,
} from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import * as postmark from 'postmark';
import { env } from 'process';

@Injectable()
export class LeaveService {
  async commentOnLeave(commentOnLeaveDto: CommentOnLeaveDto, req: any) {
    const { LeaveId, comment } = commentOnLeaveDto;
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id: LeaveId },
    });
    if (!leave) {
      throw new NotFoundException(`Leave request with ID ${LeaveId} not found`);
    }
    const { user } = req;
    const curruntEmployee = await this.prisma.employee.findFirst({
      where: { userId: user.id, isDeleted: false },
    });
    if (!curruntEmployee) {
      throw new ForbiddenException('Yor are Not Employee to Comment on Leave');
    }
    const mentioned = leave.mentionedEmplooyes;
    const mentionedEmployee = mentioned.find(
      (employee) => employee === curruntEmployee.email,
    );
    if (!mentionedEmployee) {
      throw new ForbiddenException(
        'You are not authorized to comment on leave',
      );
    }

    const leaveComment = [];
    leaveComment.push({
      comment,
      employeeId: curruntEmployee.id,
      employeeName: curruntEmployee.firstName,
    });
    const updatedLeave = await this.prisma.leaveRequest.update({
      where: { id: LeaveId },
      data: {
        comments: leaveComment,
      },
    });

    return updatedLeave;
  }

  async bulkReject(bulkApprove: BulkApprove, req: any) {
    const chekAdmin = this.chekAdmin(req);
    if (!chekAdmin) {
      throw new ForbiddenException(
        'You are not authorized to perform this action',
      );
    }
    const ids = bulkApprove.ids;
    ids.forEach(async (id) => {
      const leave = await this.prisma.leaveRequest.findUnique({
        where: { id },
      });
      if (!leave) {
        throw new NotFoundException(`Leave request with ID ${id} not found`);
      }
      const updatedLeave = await this.prisma.leaveRequest.update({
        where: { id },
        data: { status: 'rejected' },
      });
      const user = await this.prisma.user.findFirst({
        where: { id: leave.userId, isDeleted: false },
      });
      const content = `Your leave application for ${leave.startDate} to ${leave.endDate} has been Rejected`;
      const to = user.email;
      const subject = `${user.name} here is your leave status`;
      await this.mailService(content, to, subject);
    });
    return { statusCode: 200, message: 'All leaves have been rejected.' };
  }

  bulkApprove(bulkApprove: BulkApprove, req: any) {
    const chekAdmin = this.chekAdmin(req);
    if (!chekAdmin) {
      throw new ForbiddenException(
        'You are not authorized to perform this action',
      );
    }
    const ids = bulkApprove.ids;
    ids.forEach(async (id) => {
      const leave = await this.prisma.leaveRequest.findUnique({
        where: { id },
      });
      if (!leave) {
        throw new NotFoundException(`Leave request with ID ${id} not found`);
      }
      const updatedLeave = await this.prisma.leaveRequest.update({
        where: { id },
        data: { status: 'approved' },
      });
      const user = await this.prisma.user.findFirst({
        where: { id: leave.userId, isDeleted: false },
      });
      const leaveCount = await this.getAvailableLeaves(user.id);
      const updatedLeaveCount = leaveCount - 1;
      await this.updateLeaveCount(user.id, updatedLeaveCount);

      const content = `Your leave application for ${leave.startDate} to ${leave.endDate} has been Approved`;
      const to = user.email;
      const subject = `${user.name} here is your leave status`;
      await this.mailService(content, to, subject);
    });

    return {
      statusCode: 200,
      message: 'All leaves have been approved',
    };
  }
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeaveDto: CreateLeaveDto, req: any, type: any) {
    const { user } = req;
    const chek = await this.prisma.user.findUnique({
      where: { id: user.id, isDeleted: false },
    });
    if (!chek) {
      throw new NotFoundException(`User with ID ${user.id} not found`);
    }

    const availableLeaves = await this.getAvailableLeaves(user.id);
    if (availableLeaves < 1) {
      throw new ForbiddenException('You have no available leaves');
    }
    const { alsoNotify, startDate, endDate, reason } = createLeaveDto;
    const employeesEmailList = await this.notifyEmployees(user.id, alsoNotify);
    const leave = await this.prisma.leaveRequest.create({
      data: {
        startDate,
        endDate,
        reason,
        userId: chek.id,
        status: 'pending',
        leaveType: type,
        mentionedEmplooyes: employeesEmailList,
      },
    });

    const content = `${user.name}'s leave application for ${leave.startDate} to ${leave.endDate} has been submitted successfully.\n leave id is ${leave.id}`;
    const to = env.ADMIN_EMAIL;
    const subject = `${user.name} Applied For Leave`;
    await this.mailService(content, to, subject);

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
      data: {
        ...updateLeaveDto,
      },
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
    const chekAdmin = this.chekAdmin(req);
    if (!chekAdmin) {
      throw new ForbiddenException(
        'You are not authorized to perform this action',
      );
    }
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

    const leaveCount = await this.getAvailableLeaves(user.id);
    const updatedLeaveCount = leaveCount - 1;
    await this.updateLeaveCount(user.id, updatedLeaveCount);

    const email = user.email;
    const content = `Your leave application for ${leave.startDate} to ${leave.endDate} has been Approved`;
    const to = user.email;
    const subject = `${user.name} here is your leave status`;

    await this.mailService(content, to, subject);
    return updatedLeave;
  }
  async reject(approvalDto, req: any) {
    const chekAdmin = this.chekAdmin(req);
    if (!chekAdmin) {
      throw new ForbiddenException(
        'You are not authorized to perform this action',
      );
    }
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
    const content = `Your leave application for ${leave.startDate} to ${leave.endDate} has been Rejected`;
    const to = user.email;
    const subject = `${user.name} here is your leave status`;
    await this.mailService(content, to, subject);

    return updatedLeave;
  }

  async chekAdmin(req: any) {
    const { user } = req;
    const chek = await this.prisma.user.findUnique({
      where: { id: user.id, isDeleted: false },
    });
    if (!chek) {
      return false;
    }
    const chekRole = await this.prisma.role.findFirst({
      where: {
        id: chek.roleId,
        isDeleted: false,
      },
    });
    if (chekRole.name === 'admin') {
      return true;
    } else {
      return false;
    }
  }

  async getLeaveByUser(req: any) {
    const { user } = req;
    return this.prisma.leaveRequest.findMany({
      where: {
        userId: user.id,
      },
    });
  }

  async mailService(content: string, to: string, subject: string) {
    const client = new postmark.ServerClient(env.POST_MARK_API_KEY);
    const mail = {
      From: env.FROM_MAIL,
      To: `${to}`,
      Subject: `${subject}`,
      TextBody: `${content}`,
    };
    await client.sendEmail(mail);
  }

  async getAvailableLeaves(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const employee = await this.prisma.employee.findFirst({
      where: { userId: userId, isDeleted: false },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${userId} not found`);
    }
    return employee.availableLeaves;
  }

  async updateLeaveCount(userId: string, leaveCount: number) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId: userId, isDeleted: false },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${userId} not found`);
    }
    return this.prisma.employee.update({
      where: { id: employee.id },
      data: { availableLeaves: leaveCount },
    });
  }

  async notifyEmployees(userId: string, employeeList: any) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const validEmployeeList = await this.validEmployees(employeeList);

    validEmployeeList.forEach(async (employee) => {
      const content = `${user.name} has applied for leave`;
      const to = employee;
      const subject = `${user.name} has applied for leave`;
      await this.mailService(content, to, subject);
    });

    return validEmployeeList;
  }

  async validEmployees(employeeList: any) {
    const validEmployees = employeeList.map(async (email) => {
      const employee = await this.prisma.employee.findFirst({
        where: { email: email, isDeleted: false },
      });
      if (employee) {
        return employee.email;
      } else {
        return undefined;
      }
    });
    const validEmployeesEmailList = validEmployees.filter(
      (employee) => employee !== undefined,
    );
    return validEmployeesEmailList;
  }
}
