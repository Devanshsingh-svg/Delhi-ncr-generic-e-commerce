import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { CytotoxicController } from './cytotoxic.controller';
import { PrismaCytotoxicRepository } from './cytotoxic.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CytotoxicController],
  providers: [
    {
      provide: 'CytotoxicRepository',
      useClass: PrismaCytotoxicRepository,
    },
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CytotoxicModule {}
