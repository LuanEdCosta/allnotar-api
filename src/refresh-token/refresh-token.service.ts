import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RefreshTokenService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(userId: string) {
    const THIRTY_MINUTES_IN_MILLISECONDS = 1800000;

    const expiresIn = this.configService.get(
      'REFRESH_TOKEN_EXPIRES_IN',
      THIRTY_MINUTES_IN_MILLISECONDS,
    );

    const expiresInDate = new Date(Date.now() + Number(expiresIn));

    return await this.prismaService.refreshToken.create({
      data: {
        userId,
        expiresIn: expiresInDate.toISOString(),
      },
    });
  }

  async findById(id: string) {
    return await this.prismaService.refreshToken.findUnique({
      where: { id },
    });
  }

  async delete(id: string) {
    return await this.prismaService.refreshToken.delete({
      where: { id },
    });
  }

  async deleteManyByUserId(userId: string) {
    return await this.prismaService.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
