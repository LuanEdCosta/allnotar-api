import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @IsUUID('4')
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  name: string;
}
