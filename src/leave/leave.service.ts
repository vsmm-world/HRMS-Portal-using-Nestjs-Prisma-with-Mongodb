import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import * as postmark from 'postmark';
import { env } from 'process';
import { ChekAdmin } from 'src/shared/methods/check.admin';
import { ForbiddenResource } from 'src/shared/keys/forbidden.resource';
import { LeaveKeys } from 'src/shared/keys/leave.keys';
import { UserKeys } from 'src/shared/keys/user.keys';
import { EmployeeKeys } from 'src/shared/keys/employee.keys';
import { LeaveStatus } from './dto/enum.leaveStatus';
import { CommentOnLeaveDto } from './dto/comment.leave.dto';
import { BulkAction } from './dto/bulk.action.dto';
import { compareSync } from 'bcrypt';
import { ApprovalDto } from './dto/action.leave.dto';

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
      throw new ForbiddenException(LeaveKeys.NoComment);
    }
    const mentioned = leave.mentionedEmplooyes;
    const mentionedEmployee = mentioned.find(
      (employee) => employee === curruntEmployee.email,
    );
    if (!mentionedEmployee) {
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
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

  async bulkReject(bulkReject: BulkAction, req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
    }
    const ids = bulkReject.ids;
    ids.forEach(async (id) => {
      const leave = await this.prisma.leaveRequest.findUnique({
        where: { id },
        include: { User: true },
      });
      if (!leave) {
        throw new NotFoundException(LeaveKeys.NotFound);
      }
      const updatedLeave = await this.prisma.leaveRequest.update({
        where: { id },
        data: { status: LeaveStatus.REJECTED },
      });

      const content = `Your leave application for ${leave.startDate} to ${leave.endDate} has been Rejected`;
      const to = leave.User.email;
      const subject = `${leave.User.name} here is your leave status`;
      await this.mailService(content, to, subject);
    });
    return { statusCode: 200, message: LeaveKeys.AllRejected };
  }

  async bulkApprove(bulkApprove: BulkAction, req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
    }
    const ids = bulkApprove.ids;
    ids.forEach(async (id) => {
      const leave = await this.prisma.leaveRequest.findUnique({
        where: { id },
      });
      if (!leave) {
        throw new NotFoundException(LeaveKeys.NotFound);
      }
      try {
        await this.prisma.leaveRequest.update({
          where: { id },
          data: { status: LeaveStatus.APPROVED },
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
      } catch (err) {
        throw new NotFoundException(LeaveKeys.NotFound);
      }
    });

    return {
      statusCode: 200,
      message: LeaveKeys.AllAproved,
    };
  }
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeaveDto: CreateLeaveDto, req: any, type: any) {
    const { user } = req;
    console.log(user);
    const chek = await this.prisma.user.findUnique({
      where: { id: user.id, isDeleted: false },
    });
    if (!chek) {
      throw new NotFoundException(UserKeys.NotFound);
    }

    const availableLeaves = await this.getAvailableLeaves(user.id);
    if (availableLeaves < 1) {
      throw new ForbiddenException(LeaveKeys.OutOfLeaves);
    }
    const { alsoNotify, startDate, endDate, reason } = createLeaveDto;
    const employeesEmailList = await this.notifyEmployees(user.id, alsoNotify);
    const leave = await this.prisma.leaveRequest.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        userId: chek.id,
        status: LeaveStatus.PENDING,
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
    return this.prisma.leaveRequest.findMany({
      where: { isDeleted: false },
      include: { User: true },
    });
  }

  async findOne(UserId: string) {
    const leave = await this.prisma.leaveRequest.findMany({
      where: { userId: UserId, isDeleted: false },
    });
    if (leave[0] == undefined) {
      throw new NotFoundException(LeaveKeys.NotFound);
    }
    return leave;
  }

  async update(id: string, updateLeaveDto: UpdateLeaveDto) {
    const existingLeave = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });
    if (!existingLeave) {
      throw new NotFoundException(LeaveKeys.NotFound);
    }
    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        ...updateLeaveDto,
        startDate: new Date(updateLeaveDto.startDate),
        endDate: new Date(updateLeaveDto.endDate),
      },
    });
  }

  async remove(id: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });
    if (!leave) {
      throw new NotFoundException(LeaveKeys.NotFound);
    }
    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }

  async approve(approvalDto: ApprovalDto, req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
    }
    const { id } = approvalDto;
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id, isDeleted: false },
      include: { User: true },
    });
    if (!leave) {
      throw new NotFoundException(LeaveKeys.NotFound);
    }
    const updatedLeave = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: LeaveStatus.APPROVED },
    });

    const leaveCount = await this.getAvailableLeaves(leave.User.id);
    const updatedLeaveCount = leaveCount - 1;
    await this.updateLeaveCount(leave.User.id, updatedLeaveCount);
    const content = `Your leave application for ${leave.startDate} to ${leave.endDate} has been Approved`;
    const to = leave.User.email;
    const subject = `${leave.User.name} here is your leave status`;

    await this.mailService(content, to, subject);
    return updatedLeave;
  }
  async reject(approvalDto: ApprovalDto, req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
    }
    const { id } = approvalDto;
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { User: true },
    });
    if (!leave) {
      throw new NotFoundException(LeaveKeys.NotFound);
    }
    const updatedLeave = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: LeaveStatus.REJECTED },
    });

    const content = `Your leave application for ${leave.startDate} to ${leave.endDate} has been Rejected`;
    const to = leave.User.email;
    const subject = `${leave.User.name} here is your leave status`;
    await this.mailService(content, to, subject);

    return updatedLeave;
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
    });
    if (!user) {
      throw new NotFoundException(UserKeys.NotFound);
    }
    const employee = await this.prisma.employee.findFirst({
      where: { userId: userId, isDeleted: false },
    });
    if (!employee) {
      throw new NotFoundException(EmployeeKeys.NotFound);
    }
    return employee.availableLeaves;
  }

  async updateLeaveCount(userId: string, leaveCount: number) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId: userId, isDeleted: false },
    });
    if (!employee) {
      throw new NotFoundException(EmployeeKeys.NotFound);
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
      throw new NotFoundException(UserKeys.NotFound);
    }

    const validEmployeeList = await employeeList.map(async (email: string) => {
      console.log(email);
      const content = `${user.name} has applied for leave`;
      const to = email;
      const subject = `${user.name} has applied for leave`;
      await this.mailService(content, to, subject);
      return email;
    });

    const filteredEmployeeList = validEmployeeList.filter(
      (employee) => employee !== undefined,
    );

    return filteredEmployeeList;
  }

  async validEmployees(employeeList: any) {
    const validEmployees = await employeeList.map(async (email) => {
      const employee = await this.prisma.employee.findFirst({
        where: { email: email, isDeleted: false },
      });
      if (employee) {
        return employee.email;
      } else {
        return undefined;
      }
    });
    const validEmployeesEmailList = await validEmployees.filter(
      (employee) => employee !== undefined,
      console.log(validEmployees),
    );
    return validEmployeesEmailList;
  }
}
