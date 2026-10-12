import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { getEnv } from '@gq/config';

@Module({ imports: [ ConfigModule.forRoot({ isGlobal: true, validate: () => getEnv(), cache: true }), PrismaModule, AuthModule, HealthModule ] }) export class AppModule {}