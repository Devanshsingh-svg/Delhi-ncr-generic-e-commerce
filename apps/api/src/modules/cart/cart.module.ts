import { Module } from '@nestjs/common';

import { CART_REPOSITORY_TOKEN } from '@gq/domain';

import { PrismaModule } from '../../prisma/prisma.module';

import { CartController } from './cart.controller';
import { PrismaCartRepository } from './cart.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CartController],
  providers: [
    {
      provide: CART_REPOSITORY_TOKEN,
      useClass: PrismaCartRepository,
    },
  ],
  exports: [CART_REPOSITORY_TOKEN],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CartModule {}