import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { SignInDto, SignUpDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

type JwtTokenPayload = {
  sub: string;
  name: string;
  email: string;
};
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async signup(dto: SignUpDto) {
    try {
      const hash = await argon2.hash(dto.password);

      const user = await this.prismaService.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hash,
        },
      });

      const accessToken = await this.signJwtToken({
        sub: user.id,
        name: user.name,
        email: user.email,
      });

      return { accessToken };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }

      throw error;
    }
  }

  async signin(dto: SignInDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    const passwordMatches = await argon2.verify(user.password, dto.password);

    if (!passwordMatches) throw new ForbiddenException('Credentials incorrect');

    const accessToken = await this.signJwtToken({
      sub: user.id,
      name: user.name,
      email: user.email,
    });

    return { accessToken };
  }

  async signJwtToken(payload: JwtTokenPayload) {
    const secret = this.configService.get('JWT_SECRET');

    return this.jwtService.signAsync(payload, {
      expiresIn: '10m',
      secret,
    });
  }
}
