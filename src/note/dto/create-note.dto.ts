import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateNoteDto {
  @IsUUID('4')
  @IsNotEmpty()
  panelId: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;
}
