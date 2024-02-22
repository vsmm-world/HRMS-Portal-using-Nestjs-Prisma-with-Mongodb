// user.service.ts

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserKeys } from 'src/shared/keys/user.keys';
import { env } from 'process';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    const hash = await bcrypt.hash(password, 10);

    const chek = await this.prisma.user.findFirst({
      where: { email, isDeleted: false },
    });

    if (chek) {
      throw new ForbiddenException(UserKeys.EmailAlreadyUsed);
    }
    const user = await this.prisma.user.create({
      data: { name, email, roleId: env.USER_ID },
    });
    const cred = await this.prisma.userCreadentials.create({
      data: {
        userId: user.id,
        password: hash,
      },
    });

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({ where: { isDeleted: false } });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, isDeleted: false },
    });
    if (!user) {
      throw new NotFoundException(UserKeys.NotFound);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      throw new NotFoundException(UserKeys.NotFound);
    }
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(UserKeys.NotFound);
    }
    return this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }
}
