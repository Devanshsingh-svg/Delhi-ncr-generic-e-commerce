/* eslint-disable @typescript-eslint/no-explicit-any */
import { Body, Controller, Post, Get, Param, BadRequestException, Inject } from '@nestjs/common';

import {
  InitiateCheckoutRequestSchema,
  ConfirmPaymentRequestSchema,
  InitiateCheckoutResponseSchema,
  CheckoutStatusResponseSchema,
} from '@gq/contracts';
import {
  CheckoutService,
  CheckoutPersistencePort,
  CHECKOUT_REPOSITORY_TOKEN,
  CartService,
  CartPersistencePort,
  CART_REPOSITORY_TOKEN,
  PrescriptionService,
  PrescriptionPersistencePort,
  PRESCRIPTION_REPOSITORY_TOKEN,
  OrderService,
  OrderPersistencePort,
  ORDER_REPOSITORY_TOKEN,
  InventoryReservationPort,
  INVENTORY_RESERVATION_PORT_TOKEN,
} from '@gq/domain';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('checkout')
export class CheckoutController {
  private readonly service: CheckoutService;

  constructor(
    @Inject(CHECKOUT_REPOSITORY_TOKEN) checkoutRepo: CheckoutPersistencePort,
    @Inject(CART_REPOSITORY_TOKEN) cartRepo: CartPersistencePort,
    @Inject(PRESCRIPTION_REPOSITORY_TOKEN) prescriptionRepo: PrescriptionPersistencePort,
    @Inject(ORDER_REPOSITORY_TOKEN) orderRepo: OrderPersistencePort,
    @Inject(INVENTORY_RESERVATION_PORT_TOKEN) inventoryPort: InventoryReservationPort,
  ) {
    const cartService = new CartService(cartRepo);
    const prescriptionService = new PrescriptionService(prescriptionRepo);
    const orderService = new OrderService(orderRepo, prescriptionService, inventoryPort);
    this.service = new CheckoutService(checkoutRepo, cartService, prescriptionService, orderService, inventoryPort);
  }

  @Post()
  async initiate(@Body(new ZodValidationPipe(InitiateCheckoutRequestSchema)) body: any) {
    try {
      const result = await this.service.initiateCheckout(body);
      return { success: true, data: InitiateCheckoutResponseSchema.parse(result) };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.name });
    }
  }

  @Post('confirm')
  async confirmPayment(@Body(new ZodValidationPipe(ConfirmPaymentRequestSchema)) body: any) {
    try {
      const result = await this.service.confirmPayment(body.checkoutId, body.paymentIntentId);
      return { success: true, data: InitiateCheckoutResponseSchema.parse(result) };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.name });
    }
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    try {
      const status = await this.service.getCheckoutStatus(id);
      return { success: true, data: CheckoutStatusResponseSchema.parse({ status }) };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.name });
    }
  }
}