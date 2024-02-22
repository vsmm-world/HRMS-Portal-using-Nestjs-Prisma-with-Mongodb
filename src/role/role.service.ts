// role.service.ts

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignRoleDto, CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ChekAdmin } from 'src/shared/methods/check.admin';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}
  async assign(createRoleDto: AssignRoleDto, req: any) {
    const { user } = req;
    const admin = await this.prisma.user.findUnique({
      where: { id: user.id, isDeleted: false },
    });
    const chekRole = await this.prisma.role.findFirst({
      where: { id: admin.roleId },
    });

    if (chekRole.name != 'admin') {
      throw new UnauthorizedException();
    }
    const { userId, roleId } = createRoleDto;
    const chekUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
      },
    });
    if (!chekUser) {
      throw new NotFoundException('user not found');
    }
    return this.prisma.user.update({
      where: { id: chekUser.id },
      data: {
        roleId,
      },
    });
  }
  async create(createRoleDto: CreateRoleDto, req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException("You don't have permission ");
    }
    return this.prisma.role.create({
      data: {
        ...createRoleDto,
      },
    });
  }

  async findAll() {
    return this.prisma.role.findMany();
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException("You don't have permission ");
    }
    const existingRole = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!existingRole) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  async remove(id: string, req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(
        "You don't have permission to delete a Role",
      );
    }
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Role not found`);
    }
    return this.prisma.role.delete({
      where: { id },
    });
  }
}
