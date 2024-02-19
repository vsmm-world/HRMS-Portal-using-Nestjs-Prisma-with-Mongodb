import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorDto } from './dto/update-administrator.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdministratorService {
  constructor(private prisma: PrismaService) {}

  async create(createAdministratorDto: CreateAdministratorDto, req: any) {
    if (!this.chekAdmin(req)) {
      throw new UnauthorizedException('You are not admin');
    }

    const {
      contactInfo,
      jobTitle,
      department,
      lastName,
      firstName,
      userId,
      email,
    } = createAdministratorDto;

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
    if (!this.chekAdmin(req)) {
      throw new UnauthorizedException('You are not admin');
    }
    return this.prisma.employee.findMany({ where: { isDeleted: false } });
  }

  async findOne(id: string, req: any) {
    if (!this.chekAdmin(req)) {
      throw new UnauthorizedException('You are not admin');
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
    if (!this.chekAdmin(req)) {
      throw new UnauthorizedException('You are not admin');
    }
    let user = await this.findOne(id, req);
    user = { ...user, ...updateAdministratorDto };
    return this.prisma.employee.update({
      where: { id },
      data: user,
    });
  }

  async remove(id: string, req: any) {
    if (!this.chekAdmin(req)) {
      throw new UnauthorizedException('You are not admin');
    }
  }

  async chekAdmin(req: any) {
    const { user } = req;
    console.log(user);
    const chekRole = await this.prisma.role.findFirst({
      where: { id:user.roleId, isDeleted: false },
    });
    console.log(chekRole);
    if (!(chekRole.name == 'admin')) {
      return false;
    }
    return true;
  }
}
