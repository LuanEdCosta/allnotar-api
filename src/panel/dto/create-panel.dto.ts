import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePanelDto {
  @IsUUID('4')
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  name: string;
}
