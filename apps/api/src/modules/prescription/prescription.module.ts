import { Module } from '@nestjs/common';

import { PRESCRIPTION_REPOSITORY_TOKEN } from '@gq/domain';

import { PrismaModule } from '../../prisma/prisma.module';

import { PrescriptionController } from './prescription.controller';
import { PrismaPrescriptionRepository } from './prescription.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PrescriptionController],
  providers: [
    {
      provide: PRESCRIPTION_REPOSITORY_TOKEN,
      useClass: PrismaPrescriptionRepository,
    },
  ],
  exports: [PRESCRIPTION_REPOSITORY_TOKEN],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PrescriptionModule {}