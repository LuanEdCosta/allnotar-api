import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppStatus() {
    return {
      message: `App is Running`,
      now: Date.now(),
    };
  }
}
