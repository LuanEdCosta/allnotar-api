import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException('User not found');
    delete user.password;
    return user;
  }

  async findAll() {
    const users = await this.prismaService.user.findMany();
    return users.map((user) => {
      const userClone = { ...user };
      delete userClone.password;
      return userClone;
    });
  }

  async delete(id: string) {
    const user = await this.prismaService.user.delete({
      where: { id },
    });

    delete user.password;
    return user;
  }

  async update(dto: UpdateUserDto) {
    const { id, name } = dto;
    const user = await this.prismaService.user.update({
      data: { name },
      where: { id },
    });

    delete user.password;
    return user;
  }
}
