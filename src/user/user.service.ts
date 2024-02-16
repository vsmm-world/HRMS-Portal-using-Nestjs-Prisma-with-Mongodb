// user.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

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
      throw new Error('Email already in use');
    }
    const user = await this.prisma.user.create({
      data: { name, email, roleId: '65cef30f49a030360580ba32' },
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
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
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
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }
}
