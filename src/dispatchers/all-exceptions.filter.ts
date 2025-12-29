import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log(exception, 'exception');

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
    }

    if (exception.message.message && exception.message.data) {
      return response.status(status).json({
        isError: true,
        message: exception.message.message || 'Internal server error',
        data: exception.message.data,
      });
    }

    return response.status(status).json({
      isError: true,
      message: exception.message.message || exception.message || 'Internal server error',
      data: {},
    });
  }
}
