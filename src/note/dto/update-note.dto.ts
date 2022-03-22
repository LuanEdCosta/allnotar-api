import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UpdateNoteDto {
  @IsUUID('4')
  @IsNotEmpty()
  id: string;

  @IsOptional()
  title?: string;

  @IsOptional()
  content?: string;
}
