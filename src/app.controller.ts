import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('ping')
  ping() {
    return { isError: false, data: {}, message: 'pong' };
  }
}
