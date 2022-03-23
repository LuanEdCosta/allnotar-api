import { IsNotEmpty, IsUUID } from 'class-validator';

export class RefreshTokenDto {
  @IsUUID('4')
  @IsNotEmpty()
  userId: string;

  @IsUUID('4')
  @IsNotEmpty()
  refreshToken: string;
}
