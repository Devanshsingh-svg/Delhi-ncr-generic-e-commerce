import { Module } from '@nestjs/common';

import { ORDER_REPOSITORY_TOKEN } from '@gq/domain';

import { PrismaModule } from '../../prisma/prisma.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PrescriptionModule } from '../prescription/prescription.module';

import { OrderController } from './order.controller';
import { PrismaOrderRepository } from './order.repository';

@Module({
  imports: [PrismaModule, InventoryModule, PrescriptionModule],
  controllers: [OrderController],
  providers: [
    {
      provide: ORDER_REPOSITORY_TOKEN,
      useClass: PrismaOrderRepository,
    },
  ],
  exports: [ORDER_REPOSITORY_TOKEN],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class OrderModule {}