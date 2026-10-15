import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { getEnv } from '@gq/config';
import { NotConfiguredUserRepository, USER_REPOSITORY_TOKEN } from '@gq/domain';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getEnv().JWT_SECRET,
        signOptions: { issuer: getEnv().JWT_ISSUER, audience: getEnv().JWT_AUDIENCE },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    { provide: USER_REPOSITORY_TOKEN, useClass: NotConfiguredUserRepository },
  ],
  exports: [AuthService, JwtModule, USER_REPOSITORY_TOKEN],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthModule {}