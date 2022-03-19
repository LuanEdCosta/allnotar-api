import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
