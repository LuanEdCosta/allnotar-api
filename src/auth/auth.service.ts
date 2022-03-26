import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenDto, SignInDto, SignUpDto } from './dto';

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

      const payload: TokenDto = {
        sub: user.id,
        name: user.name,
        email: user.email,
      };

      const accessToken = await this.generateAccessToken(payload);
      const refreshToken = await this.generateRefreshToken(payload);

      await this.prismaService.user.update({
        data: { refreshToken },
        where: { id: user.id },
      });

      return { accessToken, refreshToken };
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

    const payload: TokenDto = {
      sub: user.id,
      name: user.name,
      email: user.email,
    };

    const accessToken = await this.generateAccessToken(payload);

    if (user.refreshToken) {
      return {
        accessToken,
        refreshToken: user.refreshToken,
      };
    }

    const refreshToken = await this.generateRefreshToken(payload);

    await this.prismaService.user.update({
      data: { refreshToken },
      where: { id: user.id },
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);

    const error = new BadRequestException('Invalid refresh token');
    if (!payload) throw error;

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });

    if (user?.refreshToken !== refreshToken) throw error;

    const newAccessToken = await this.generateAccessToken(payload);
    const newRefreshToken = await this.generateRefreshToken(payload);

    await this.prismaService.user.update({
      data: { refreshToken: newRefreshToken },
      where: { id: payload.sub },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload) throw new BadRequestException('Invalid refresh token');
    await this.prismaService.user.update({
      data: { refreshToken: null },
      where: { id: payload.sub },
    });
  }

  private async generateAccessToken(payload: TokenDto) {
    const secret = this.configService.get('ACCESS_TOKEN_SECRET');
    const expiresIn = this.configService.get('ACCESS_TOKEN_EXPIRES_IN');
    return this.jwtService.signAsync(payload, {
      expiresIn,
      secret,
    });
  }

  private async generateRefreshToken(payload: TokenDto) {
    const secret = this.configService.get('REFRESH_TOKEN_SECRET');
    return this.jwtService.signAsync(payload, { secret });
  }

  private async verifyRefreshToken(refreshToken: string): Promise<TokenDto> {
    try {
      const secret = this.configService.get('REFRESH_TOKEN_SECRET');
      const { sub, name, email } = await this.jwtService.verifyAsync<TokenDto>(
        refreshToken,
        { secret },
      );
      return { sub, name, email };
    } catch {
      return null;
    }
  }
}
