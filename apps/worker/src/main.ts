import { NestFactory } from '@nestjs/core';

import { getLogger, initTracing } from '@gq/observability';

import { WorkerModule } from './worker.module';
async function bootstrap() {
  initTracing();
  const logger = getLogger();
  const _app = await NestFactory.createApplicationContext(WorkerModule);
  logger.info('Worker process started');
}
bootstrap();