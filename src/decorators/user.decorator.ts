import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtTokenInterface } from '../interface/jwt.token.interface';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtTokenInterface => {
    const request = ctx.switchToHttp().getRequest();
    const user = (request as { user?: JwtTokenInterface }).user;
    if (!user) {
      throw new Error('User not found in request');
    }
    return user;
  },
);

export const OptionalUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtTokenInterface | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return (request as { user?: JwtTokenInterface }).user;
  },
);
