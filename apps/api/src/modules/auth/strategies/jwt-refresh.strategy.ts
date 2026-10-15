import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// eslint-disable-next-line import/no-unresolved -- express types from @nestjs/platform-express
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { getEnv, APP_CONSTANTS } from '@gq/config';
import { UserRepository, USER_REPOSITORY_TOKEN } from '@gq/domain';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(@Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: UserRepository) {
    const env = getEnv();
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.body?.refreshToken,
        (req) => req?.cookies?.[APP_CONSTANTS.REFRESH_TOKEN_COOKIE],
      ]),
      ignoreExpiration: false,
      secretOrKey: env.JWT_SECRET,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string }) {
    const refreshToken = req.body?.refreshToken ?? req.cookies?.[APP_CONSTANTS.REFRESH_TOKEN_COOKIE];
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');
    const stored = await this.userRepo.findRefreshToken(refreshToken);
    if (!stored || stored.revoked || stored.expiresAt < new Date()) throw new UnauthorizedException('Invalid or expired refresh token');
    return { ...payload, refreshToken };
  }
}