import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { PanelDto } from './dto';
import { PanelService } from './panel.service';

@UseGuards(JwtGuard)
@Controller('panels')
export class PanelController {
  constructor(private panelService: PanelService) {}

  @Post()
  create(@GetUser('id') userId: string, @Body() dto: PanelDto) {
    return this.panelService.create(userId, dto);
  }

  @Get()
  findAll() {
    return this.panelService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.panelService.findById(id);
  }

  @Patch()
  update(@Body() dto: PanelDto) {
    return this.panelService.update(dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.panelService.delete(id);
  }
}
