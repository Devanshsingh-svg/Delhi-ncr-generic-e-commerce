import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { OrderController } from './order.controller';
import { PrismaOrderRepository } from './order.repository';

@Module({
  imports: [PrismaModule],
  controllers: [OrderController],
  providers: [
    {
      provide: 'OrderRepository',
      useClass: PrismaOrderRepository,
    },
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class OrderModule {}
