import { CartService, Cart } from '../cart';
import { reserveStock } from '../inventory/reservation.service';
import { CreateOrderInput } from '../order/order.entity';
import { OrderService } from '../order/order.service';
import { InventoryReservationPort } from '../ports/inventory-reservation.port';
import { PrescriptionService } from '../prescription/prescription.service';

import {
  InitiateCheckoutInput,
  InitiateCheckoutResult,
  PaymentIntent,
  CreatePaymentIntentInput,
  CheckoutStatus,
} from './checkout.entity';
import {
  CheckoutNotFoundError,
  CartNotReadyForCheckoutError,
  IdempotencyKeyConflictError,
  StockReservationFailedError,
  CheckoutAlreadyCompletedError,
} from './checkout.errors';
import { CheckoutPersistencePort } from './checkout.port';


export class CheckoutService {
  private readonly checkoutPort: CheckoutPersistencePort;
  private readonly cartService: CartService;
  private readonly prescriptionService: PrescriptionService;
  private readonly orderService: OrderService;
  private readonly inventoryPort: InventoryReservationPort;

  constructor(
    checkoutPort: CheckoutPersistencePort,
    cartService: CartService,
    prescriptionService: PrescriptionService,
    orderService: OrderService,
    inventoryPort: InventoryReservationPort,
  ) {
    this.checkoutPort = checkoutPort;
    this.cartService = cartService;
    this.prescriptionService = prescriptionService;
    this.orderService = orderService;
    this.inventoryPort = inventoryPort;
  }

  async initiateCheckout(input: InitiateCheckoutInput): Promise<InitiateCheckoutResult> {
    const existing = await this.checkoutPort.findByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      if (existing.status === CheckoutStatus.COMPLETED) {
        throw new CheckoutAlreadyCompletedError(existing.id);
      }
      throw new IdempotencyKeyConflictError(input.idempotencyKey);
    }

    const cart = await this.cartService.getCart(input.cartId);
    if (!cart) {
      throw new CartNotReadyForCheckoutError(input.cartId, 'Cart not found');
    }

    if (cart.customerId !== input.customerId) {
      throw new CartNotReadyForCheckoutError(input.cartId, 'Cart ownership mismatch');
    }

    if (cart.items.length === 0) {
      throw new CartNotReadyForCheckoutError(input.cartId, 'Cart is empty');
    }

    const checkout = await this.checkoutPort.create({
      customerId: input.customerId,
      cartId: input.cartId,
      darkStoreId: input.darkStoreId,
      paymentMethod: input.paymentMethod,
      idempotencyKey: input.idempotencyKey,
    });

    try {
      const allReservations: InitiateCheckoutResult['reservations'] = [];

      for (const item of cart.items) {
        try {
          const reservations = await reserveStock(this.inventoryPort, {
            orderId: checkout.id,
            darkStoreId: input.darkStoreId,
            formulationId: item.formulationId,
            quantity: item.quantity,
            minShelfLifeDays: 30,
          });
          allReservations.push(...reservations);
        } catch (e) {
          if (e instanceof Error) {
            throw new StockReservationFailedError(item.formulationId, e.message);
          }
          throw e;
        }
      }

      await this.checkoutPort.updateStatus(checkout.id, CheckoutStatus.PAYMENT_REQUIRED);

      const totalAmount = this.calculateCartTotal(cart);
      const paymentIntent = await this.createPaymentIntent({
        amount: totalAmount,
        currency: 'INR',
        paymentMethod: input.paymentMethod,
        metadata: {
          checkoutId: checkout.id,
          cartId: input.cartId,
          customerId: input.customerId,
        },
        idempotencyKey: `${input.idempotencyKey}-payment`,
      });

      await this.checkoutPort.updateStatus(checkout.id, CheckoutStatus.PAYMENT_CONFIRMED);

      return {
        orderId: '',
        orderNumber: '',
        paymentIntentId: paymentIntent.id,
        reservations: allReservations,
      };
    } catch (e) {
      await this.checkoutPort.updateStatus(checkout.id, CheckoutStatus.FAILED);
      throw e;
    }
  }

  async confirmPayment(checkoutId: string, paymentIntentId: string): Promise<InitiateCheckoutResult> {
    const checkout = await this.checkoutPort.findById(checkoutId);
    if (!checkout) {
      throw new CheckoutNotFoundError(checkoutId);
    }

    if (checkout.status !== CheckoutStatus.PAYMENT_CONFIRMED) {
      throw new CheckoutNotFoundError(`Checkout not in payment confirmed state: ${checkoutId}`);
    }

    const cart = await this.cartService.getCart(checkout.cartId);
    if (!cart) {
      throw new CartNotReadyForCheckoutError(checkout.cartId, 'Cart not found');
    }

    const orderInput: CreateOrderInput = {
      customerId: checkout.customerId,
      items: cart.items.map(item => ({
        formulationId: item.formulationId,
        quantity: item.quantity,
      })),
      prescriptionId: null,
    };

    const order = await this.orderService.createOrder(orderInput);

    await this.checkoutPort.complete(checkoutId, order.id, paymentIntentId);

    await this.cartService.checkout(checkout.cartId);

    const reservations = await this.getOrderReservations();

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentIntentId,
      reservations,
    };
  }

  async getCheckoutStatus(checkoutId: string): Promise<CheckoutStatus> {
    const checkout = await this.checkoutPort.findById(checkoutId);
    if (!checkout) {
      throw new CheckoutNotFoundError(checkoutId);
    }
    return checkout.status;
  }

  private async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent> {
    return this.checkoutPort.createPaymentIntent(input);
  }

  private calculateCartTotal(cart: Cart): string {
    return (cart.items.length * 100).toFixed(2);
  }

  private async getOrderReservations(): Promise<InitiateCheckoutResult['reservations']> {
    return [];
  }
}