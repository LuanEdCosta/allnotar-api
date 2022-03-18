import { Injectable } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto';

@Injectable()
export class AuthService {
  signup(dto: SignUpDto) {
    return dto;
  }

  signin(dto: SignInDto) {
    return dto;
  }
}
