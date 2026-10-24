import { Module } from '@nestjs/common';

import { CYTOTOXIC_REPOSITORY_TOKEN } from '@gq/domain';

import { PrismaModule } from '../../prisma/prisma.module';

import { CytotoxicController } from './cytotoxic.controller';
import { PrismaCytotoxicRepository } from './cytotoxic.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CytotoxicController],
  providers: [
    {
      provide: CYTOTOXIC_REPOSITORY_TOKEN,
      useClass: PrismaCytotoxicRepository,
    },
  ],
  exports: [CYTOTOXIC_REPOSITORY_TOKEN],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CytotoxicModule {}