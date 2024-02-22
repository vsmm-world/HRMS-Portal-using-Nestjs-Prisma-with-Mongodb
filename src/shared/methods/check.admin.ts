import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export class ChekAdmin {
  static async chekAdmin(req: any, prisma: PrismaService) {
    const { user } = req;

    const admin = await prisma.user.findFirst({
      where: { id: user.id, isDeleted: false },
    });
    const role = await prisma.role.findFirst({
      where: { id: admin.roleId, isDeleted: false },
    });

    if (role.name !== 'admin') {
      return false;
    }
    return true;
  }
}
