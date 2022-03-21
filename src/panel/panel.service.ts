import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PanelDto } from './dto';

@Injectable()
export class PanelService {
  constructor(private prismaService: PrismaService) {}

  async create(userId: string, dto: PanelDto) {
    const { name } = dto;
    return await this.prismaService.panel.create({
      data: { name, userId },
    });
  }

  async findAll() {
    return await this.prismaService.panel.findMany();
  }

  async findById(id: string) {
    return await this.prismaService.panel.findUnique({
      where: {
        id,
      },
    });
  }

  async update(dto: PanelDto) {
    const { id, name } = dto;
    return await this.prismaService.panel.update({
      data: { name },
      where: { id },
    });
  }

  async delete(id: string) {
    return await this.prismaService.panel.delete({
      where: { id },
    });
  }
}
