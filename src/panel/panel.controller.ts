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
import { JwtGuard } from 'src/auth/guard';
import { PanelService } from './panel.service';
import { CreatePanelDto, UpdatePanelDto } from './dto';

@UseGuards(JwtGuard)
@Controller('panels')
export class PanelController {
  constructor(private panelService: PanelService) {}

  @Post()
  create(@Body() dto: CreatePanelDto) {
    return this.panelService.create(dto);
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
  update(@Body() dto: UpdatePanelDto) {
    return this.panelService.update(dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.panelService.delete(id);
  }
}
