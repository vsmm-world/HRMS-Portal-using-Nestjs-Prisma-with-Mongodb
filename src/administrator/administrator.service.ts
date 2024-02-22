import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorDto } from './dto/update-administrator.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChekAdmin } from 'src/shared/methods/check.admin';
import { ForbiddenResource } from 'src/shared/keys/forbidden.resource';
import { UserKeys } from 'src/shared/keys/user.keys';
import { EmployeeKeys } from 'src/shared/keys/employee.keys';
import { env } from 'process';

@Injectable()
export class AdministratorService {
  constructor(private prisma: PrismaService) {}

  async create(createAdministratorDto: CreateAdministratorDto, req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
    }
    const { userId } = createAdministratorDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException(UserKeys.NotFound);
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
        isDeleted: false,
      },
      data: {
        roleId: env.EMPLOYEE_ID,
      },
    });
    return this.prisma.employee.create({
      data: { ...createAdministratorDto },
    });
  }

  async findAll(req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
    }
    return this.prisma.employee.findMany({ where: { isDeleted: false } });
  }

  async findOne(id: string, req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
    }
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });
    if (!employee) {
      throw new NotFoundException(EmployeeKeys.NotFound);
    }
    return employee;
  }

  async update(
    id: string,
    updateAdministratorDto: UpdateAdministratorDto,
    req: any,
  ) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
    }
    let user = await this.findOne(id, req);
    user = { ...user, ...updateAdministratorDto };
    return this.prisma.employee.update({
      where: { id },
      data: user,
    });
  }

  async remove(id: string, req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
    }
    await this.prisma.employee.update({
      where: { id },
      data: { isDeleted: true },
    });
    return {
      statusCode: 200,
      message: EmployeeKeys.Deleted,
    };
  }
}
