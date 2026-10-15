import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { getLogger } from '@gq/observability';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = getLogger().child({ module: 'PrismaService' });

  async onModuleInit() {
    await this['$connect']();
    this.logger.info('Prisma connected');
  }

  async onModuleDestroy() {
    await this['$disconnect']();
    this.logger.info('Prisma disconnected');
  }

  async cleanDatabase() {
    if (process.env['NODE_ENV'] === 'production') throw new Error('cleanDatabase forbidden in production');
    const models = Reflect.ownKeys(this).filter(k => typeof k === 'string' && !k.startsWith('_') && !k.startsWith('$'));
    for (const model of models) {
      if (typeof this[model as string]?.deleteMany === 'function') {
        await this[model as string].deleteMany();
      }
    }
  }
}