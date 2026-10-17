import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { getEnv } from '@gq/config';

import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { PrescriptionModule } from './modules/prescription/prescription.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: () => getEnv(), cache: true }),
    PrismaModule,
    AuthModule,
    HealthModule,
    PrescriptionModule,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}