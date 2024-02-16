import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto, verifyOTPDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { env } from 'process';
import * as bcrypt from 'bcrypt';
import * as postmark from 'postmark';
import * as otpGenerator from 'otp-generator';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async whoami(req: any) {
    const { user } = req;
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const userSession = await this.prisma.userSession.findFirst({
      where: { userId: user.id, isDeleted: false },
    });
    return {
      user,
      userSession,
    };
  }
  async logout(req: any) {
    const { user } = req;
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const session = await this.prisma.userSession.findFirst({
      where: {
        userId: user.id,
        isDeleted: false,
      },
    });
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { token: null, expiresAt: null },
    });

    return {
      statusCode: 200,
      message: 'Logged out successfully',
    };
  }
  async validateOtp(verifyOTPDto: verifyOTPDto) {
    const { otp, otpRef } = verifyOTPDto;

    const userSession = await this.prisma.userSession.findFirst({
      where: {
        otpRef,
        isDeleted: false,
      },
    });
    if (userSession.otp == otp) {
      const token = this.generatejwtToken(userSession.userId);

      const updatedUserSession = await this.prisma.userSession.update({
        where: { id: userSession.id },
        data: {
          otp: null,
          otpRef: null,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 600000),
        },
      });

      return { updatedUserSession, token };
    }
  }

  async login(createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;

    const user = await this.prisma.user.findFirst({
      where: { email, isDeleted: false },
    });

    if (user) {
      const userCreadentials = await this.prisma.userCreadentials.findFirst({
        where: { userId: user.id, isDeleted: false },
      });
      const match = await bcrypt.compare(password, userCreadentials.password);
      if (match) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpRef = otpGenerator.generate(6, {
          upperCase: false,
          specialChars: false,
          alphabets: false,
        });
        let userSession = await this.prisma.userSession.findFirst({
          where: { userId: user.id },
        });
        if (!userSession) {
          userSession = await this.prisma.userSession.create({
            data: {
              userId: user.id,
              otp,
              otpRef,
              expiresAt: new Date(Date.now() + 2 * 60 * 1000),
            },
          });
        }

        await this.prisma.userSession.update({
          where: { id: userSession.id },
          data: { otp, otpRef },
        });

        const client = new postmark.ServerClient(env.POST_MARK_API_KEY);

        const mail = {
          TemplateId: 34277244,

          TemplateModel: {
            otp: otp,
          },
          From: 'rushi@syscreations.com',
          To: user.email,
        };

        client.sendEmailWithTemplate(mail);

        return {
          otpRef,
        };
      }
    }
    throw new BadRequestException('Invalid credentials');
  }

  generatejwtToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload);
  }
}
