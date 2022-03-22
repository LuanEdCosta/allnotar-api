import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UpdatePanelDto {
  @IsUUID('4')
  @IsOptional()
  id: string;

  @IsNotEmpty()
  name: string;
}
