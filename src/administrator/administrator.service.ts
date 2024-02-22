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

@Injectable()
export class AdministratorService {
  constructor(private prisma: PrismaService) {}

  async create(createAdministratorDto: CreateAdministratorDto, req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(
        "You don't have permission",
      );
    }
    const { userId } = createAdministratorDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
        isDeleted: false,
      },
      data: {
        roleId: '65d24041d7ba66596aa57fa2',
      },
    });
    return this.prisma.employee.create({
      data: { ...createAdministratorDto },
    });
  }

  async findAll(req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(
        "You don't have permission",
      );
    }
    return this.prisma.employee.findMany({ where: { isDeleted: false } });
  }

  async findOne(id: string, req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(
        "You don't have permission",
      );
    }
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID "${id}" not found`);
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
      throw new ForbiddenException(
        "You don't have permission",
      );
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
      throw new ForbiddenException(
        "You don't have permission",
      );
    }
    await this.prisma.employee.update({
      where: { id },
      data: { isDeleted: true },
    });
    return {
      statusCode: 200,
      message: 'Employee deleted successfully',
    };
  }

}
