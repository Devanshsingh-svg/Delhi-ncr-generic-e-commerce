import { Body, Controller, Post, Get, Param, BadRequestException, Inject } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CreateOrderRequestSchema,
  CheckoutRequestSchema,
  ConfirmOrderRequestSchema,
  OrderResponseSchema,
  CheckoutResponseSchema,
} from '@gq/contracts';
import { OrderService } from '@gq/domain';
import { OrderPersistencePort } from '@gq/domain';

@Controller('orders')
export class OrderController {
  private readonly service: OrderService;

  constructor(
    @Inject('OrderRepository') private readonly repo: OrderPersistencePort,
  ) {
    this.service = new OrderService(repo, null as any, null as any);
  }

  @Post()
  async create(@Body(new ZodValidationPipe(CreateOrderRequestSchema)) body: any) {
    try {
      const order = await this.service.createOrder(body);
      return { success: true, data: OrderResponseSchema.parse(order) };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.code });
    }
  }

  @Post('checkout')
  async checkout(@Body(new ZodValidationPipe(CheckoutRequestSchema)) body: any) {
    try {
      const result = await this.service.checkout(body);
      return { success: true, data: CheckoutResponseSchema.parse(result) };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.code });
    }
  }

  @Post(':id/confirm')
  async confirm(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ConfirmOrderRequestSchema)) body: any,
  ) {
    try {
      const order = await this.service.confirmOrder({ orderId: id, ...body });
      return { success: true, data: OrderResponseSchema.parse(order) };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.code });
    }
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    try {
      await this.service.cancelOrder(id);
      return { success: true, data: { orderId: id } };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.code });
    }
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    const order = await this.service.getOrder(id);
    if (!order) {
      throw new BadRequestException({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });
    }
    return { success: true, data: OrderResponseSchema.parse(order) };
  }

  @Get('customer/:customerId')
  async getCustomerOrders(@Param('customerId') customerId: string) {
    const orders = await this.service.getCustomerOrders(customerId);
    return { success: true, data: orders.map(o => OrderResponseSchema.parse(o)) };
  }
}
