/* eslint-disable @typescript-eslint/no-explicit-any */
import { Body, Controller, Get, Post, Patch, Delete, Param, BadRequestException, Inject, HttpCode, HttpStatus } from '@nestjs/common';

import {
  AddCartItemRequestSchema,
  UpdateCartItemRequestSchema,
  CartResponseSchema,
  CartItemResponseSchema,
  CartTotalsResponseSchema,
} from '@gq/contracts';
import { CartService, CART_REPOSITORY_TOKEN, CartPersistencePort } from '@gq/domain';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('cart')
export class CartController {
  private readonly service: CartService;

  constructor(
    @Inject(CART_REPOSITORY_TOKEN) private readonly repo: CartPersistencePort,
  ) {
    this.service = new CartService(repo);
  }

  @Get('customer/:customerId')
  async getCustomerCart(@Param('customerId') customerId: string) {
    const cart = await this.service.getCustomerCart(customerId);
    if (!cart) {
      return { success: true, data: null };
    }
    return { success: true, data: CartResponseSchema.parse(cart) };
  }

  @Post('customer/:customerId/items')
  async addItem(
    @Param('customerId') customerId: string,
    @Body(new ZodValidationPipe(AddCartItemRequestSchema)) body: any,
  ) {
    try {
      let cart = await this.service.getCustomerCart(customerId);
      if (!cart) {
        cart = await this.service.getOrCreateCart(customerId);
      }

      const item = await this.service.addItem({
        cartId: cart.id,
        formulationId: body.formulationId,
        quantity: body.quantity,
      });

      return { success: true, data: CartItemResponseSchema.parse(item) };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.name });
    }
  }

  @Patch('customer/:customerId/items/:itemId')
  async updateItem(
    @Param('customerId') customerId: string,
    @Param('itemId') itemId: string,
    @Body(new ZodValidationPipe(UpdateCartItemRequestSchema)) body: any,
  ) {
    try {
      const cart = await this.service.getCustomerCart(customerId);
      if (!cart) {
        throw new BadRequestException({ message: 'Cart not found', code: 'CART_NOT_FOUND' });
      }

      const item = await this.service.updateItem({
        cartId: cart.id,
        itemId,
        quantity: body.quantity,
      });

      return { success: true, data: CartItemResponseSchema.parse(item) };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.name });
    }
  }

  @Delete('customer/:customerId/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Param('customerId') customerId: string,
    @Param('itemId') itemId: string,
  ) {
    try {
      const cart = await this.service.getCustomerCart(customerId);
      if (!cart) {
        throw new BadRequestException({ message: 'Cart not found', code: 'CART_NOT_FOUND' });
      }

      await this.service.removeItem({
        cartId: cart.id,
        itemId,
      });
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.name });
    }
  }

  @Delete('customer/:customerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@Param('customerId') customerId: string) {
    try {
      const cart = await this.service.getCustomerCart(customerId);
      if (!cart) {
        throw new BadRequestException({ message: 'Cart not found', code: 'CART_NOT_FOUND' });
      }

      await this.service.clearCart(cart.id);
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.name });
    }
  }

  @Get('customer/:customerId/totals')
  async getTotals(@Param('customerId') customerId: string) {
    const cart = await this.service.getCustomerCart(customerId);
    if (!cart) {
      return { success: true, data: { itemCount: 0, totalQuantity: 0 } };
    }
    const totals = this.service.getCartTotals(cart);
    return { success: true, data: CartTotalsResponseSchema.parse(totals) };
  }

  @Post('customer/:customerId/checkout')
  async checkout(@Param('customerId') customerId: string) {
    try {
      const cart = await this.service.getCustomerCart(customerId);
      if (!cart) {
        throw new BadRequestException({ message: 'Cart not found', code: 'CART_NOT_FOUND' });
      }

      await this.service.checkout(cart.id);

      return { success: true, data: { cartId: cart.id, message: 'Cart ready for checkout' } };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.name });
    }
  }
}