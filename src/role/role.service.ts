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
import { ForbiddenResource } from 'src/shared/keys/forbidden.resource';
import { UserKeys } from 'src/shared/keys/user.keys';
import { RoleKeys } from 'src/shared/keys/role.keys';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}
  async assign(createRoleDto: AssignRoleDto, req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
    }
    const { userId, roleId } = createRoleDto;
    const chekUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
      },
    });
    if (!chekUser) {
      throw new NotFoundException(UserKeys.NotFound);
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
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
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
      throw new NotFoundException(RoleKeys.NotFound);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
    }
    const existingRole = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!existingRole) {
      throw new NotFoundException(RoleKeys.NotFound);
    }
    return this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  async remove(id: string, req: any) {
    const chekAdmin = await ChekAdmin.chekAdmin(req, this.prisma);
    if (!chekAdmin) {
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
    }
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(RoleKeys.NotFound);
    }
    return this.prisma.role.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }
}
