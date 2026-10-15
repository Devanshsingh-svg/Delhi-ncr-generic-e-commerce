import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { getLogger } from '@gq/observability';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = getLogger().child({ guard: 'JwtAuthGuard' });

  override canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  // Match base class generic signature exactly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override handleRequest<TUser = any>(err: Error, user: TUser, info: Error | undefined, _context: ExecutionContext): TUser {
    if (err || !user) {
      this.logger.warn({ err: info?.message }, 'JWT authentication failed');
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}