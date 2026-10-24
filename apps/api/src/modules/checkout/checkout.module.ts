import { Module } from '@nestjs/common';

import { CHECKOUT_REPOSITORY_TOKEN } from '@gq/domain';

import { PrismaModule } from '../../prisma/prisma.module';
import { CartModule } from '../cart/cart.module';
import { InventoryModule } from '../inventory/inventory.module';
import { OrderModule } from '../order/order.module';
import { PrescriptionModule } from '../prescription/prescription.module';

import { CheckoutController } from './checkout.controller';
import { PrismaCheckoutRepository } from './checkout.repository';

@Module({
  imports: [PrismaModule, CartModule, InventoryModule, OrderModule, PrescriptionModule],
  controllers: [CheckoutController],
  providers: [
    {
      provide: CHECKOUT_REPOSITORY_TOKEN,
      useClass: PrismaCheckoutRepository,
    },
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CheckoutModule {}