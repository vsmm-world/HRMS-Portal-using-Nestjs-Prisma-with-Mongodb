import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserKeys } from 'src/shared/keys/user.keys';
import { env } from 'process';

// user.service.ts

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
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
    } catch (error) {
      throw new ForbiddenException(UserKeys.EmailAlreadyUsed);
    }
  }

  async findAll() {
    try {
      return this.prisma.user.findMany({
        where: { isDeleted: false },
        include: { Role: true },
      });
    } catch (error) {
      throw new NotFoundException(UserKeys.NotFound);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id, isDeleted: false },
      });
      if (!user) {
        throw new NotFoundException(UserKeys.NotFound);
      }
      return user;
    } catch (error) {
      throw new NotFoundException(UserKeys.NotFound);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
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
    } catch (error) {
      throw new NotFoundException(UserKeys.NotFound);
    }
  }

  async remove(id: string) {
    try {
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
    } catch (error) {
      throw new NotFoundException(UserKeys.NotFound);
    }
  }
}
