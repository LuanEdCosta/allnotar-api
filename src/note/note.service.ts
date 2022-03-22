import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto } from './dto';

@Injectable()
export class NoteService {
  constructor(private prismaService: PrismaService) {}

  async create(dto: CreateNoteDto) {
    const { panelId, title, content } = dto;
    return await this.prismaService.note.create({
      data: { panelId, title, content },
    });
  }

  async findAll() {
    return await this.prismaService.note.findMany();
  }

  async findById(id: string) {
    return await this.prismaService.note.findUnique({
      where: { id },
    });
  }

  async update(dto: UpdateNoteDto) {
    const { id, title, content } = dto;
    return await this.prismaService.note.update({
      data: { title, content },
      where: { id },
    });
  }

  async delete(id: string) {
    return await this.prismaService.note.delete({
      where: { id },
    });
  }
}
