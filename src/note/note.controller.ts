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
import { CreateNoteDto, UpdateNoteDto } from './dto';
import { NoteService } from './note.service';

@UseGuards(JwtGuard)
@Controller('notes')
export class NoteController {
  constructor(private noteService: NoteService) {}

  @Post()
  create(@Body() dto: CreateNoteDto) {
    return this.noteService.create(dto);
  }

  @Get()
  findAll() {
    return this.noteService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.noteService.findById(id);
  }

  @Patch()
  update(@Body() dto: UpdateNoteDto) {
    return this.noteService.update(dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.noteService.delete(id);
  }
}
