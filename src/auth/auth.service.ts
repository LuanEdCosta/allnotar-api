import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { JwtDto, RefreshTokenDto, SignInDto, SignUpDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private configService: ConfigService,
    private refreshTokenService: RefreshTokenService,
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

      const accessToken = await this.generateJwtToken({
        sub: user.id,
        name: user.name,
        email: user.email,
      });

      const refreshToken = await this.refreshTokenService.create(user.id);

      return {
        accessToken,
        refreshToken,
      };
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

    const accessToken = await this.generateJwtToken({
      sub: user.id,
      name: user.name,
      email: user.email,
    });

    await this.refreshTokenService.deleteManyByUserId(user.id);
    const refreshToken = await this.refreshTokenService.create(user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken({ refreshToken, userId }: RefreshTokenDto) {
    const refreshTokenBeingUsed = await this.refreshTokenService.findById(
      refreshToken,
    );

    const error = new BadRequestException('Invalid refresh token');
    if (!refreshTokenBeingUsed) throw error;
    if (refreshTokenBeingUsed.userId !== userId) throw error;

    if (refreshTokenBeingUsed.expiresIn.getTime() <= Date.now()) {
      await this.refreshTokenService.delete(refreshToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    await this.refreshTokenService.deleteManyByUserId(userId);

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    const newAccessToken = await this.generateJwtToken({
      sub: user.id,
      name: user.name,
      email: user.email,
    });

    const newRefreshToken = await this.refreshTokenService.create(userId);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  private async generateJwtToken(payload: JwtDto) {
    const secret = this.configService.get('JWT_SECRET');
    const expiresIn = this.configService.get('JWT_EXPIRES_IN');
    return this.jwtService.signAsync(payload, {
      expiresIn,
      secret,
    });
  }
}
