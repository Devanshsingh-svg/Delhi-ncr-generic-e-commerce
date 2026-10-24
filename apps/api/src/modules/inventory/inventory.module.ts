import { Module } from '@nestjs/common';

import { INVENTORY_RESERVATION_PORT_TOKEN } from '@gq/domain';

import { PrismaModule } from '../../prisma/prisma.module';

import { PrismaInventoryRepository } from './inventory.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: INVENTORY_RESERVATION_PORT_TOKEN,
      useClass: PrismaInventoryRepository,
    },
  ],
  exports: [INVENTORY_RESERVATION_PORT_TOKEN],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InventoryModule {}