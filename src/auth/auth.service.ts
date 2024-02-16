import { Injectable } from '@nestjs/common';
import { CreateAuthDto, verifyOTPDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  whoami(req: any) {
    throw new Error('Method not implemented.');
  }
  logout(req: any) {
    throw new Error('Method not implemented.');
  }
  validateOtp(verifyOTPDto: verifyOTPDto) {
    throw new Error('Method not implemented.');
  }
  login(createAuthDto: CreateAuthDto) {
    throw new Error('Method not implemented.');
  }

  generatejwtToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload);
  }
}
