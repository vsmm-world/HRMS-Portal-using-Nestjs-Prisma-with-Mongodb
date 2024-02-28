import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { get } from 'http';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdministratorKeys } from 'src/shared/keys/administator.keys';
import { ForbiddenResource } from 'src/shared/keys/forbidden.resource';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'RavindraValand',
    });
  }
  async validate(payload: any) {
    try{
    if (payload.sub == undefined) {
      throw new ForbiddenException(ForbiddenResource.AccessDenied);
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    const session = await this.prisma.userSession.findFirst({
      where: {
        userId: user.id,
        expiresAt: {
          gt: new Date(Date.now()),
        },
      },
    });
    if (!session) {
      throw new UnauthorizedException();
    }
    return user;
  }catch(err){
    console.log('somethign goes wrong ' + err)
  
  }
}
}
