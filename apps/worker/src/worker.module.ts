 import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { getEnv } from '@gq/config';

import { QueueConfig } from './queues/queue.config';

// WorkerModule configures BullMQ queues - class required by @Module decorator
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: () => getEnv() }),
    BullModule.forRoot({ connection: { url: getEnv().REDIS_URL, maxRetriesPerRequest: null } }),
    BullModule.registerQueue(...QueueConfig.queues.map(q => ({ ...q, defaultJobOptions: QueueConfig.defaultJobOptions }))),
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class WorkerModule {}