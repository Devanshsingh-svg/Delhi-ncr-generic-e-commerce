import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrescriptionController } from './prescription.controller';
import { PrismaPrescriptionRepository } from './prescription.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PrescriptionController],
  providers: [
    {
      provide: 'PrescriptionRepository',
      useClass: PrismaPrescriptionRepository,
    },
  ],
})
export class PrescriptionModule {}
