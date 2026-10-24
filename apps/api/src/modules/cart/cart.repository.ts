/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';

import {
  CartPersistencePort,
  Cart,
  CartItem,
  CreateCartInput,
  AddCartItemInput,
  UpdateCartItemInput,
  RemoveCartItemInput,
} from '@gq/domain';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaCartRepository implements CartPersistencePort {
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async create(input: CreateCartInput): Promise<Cart> {
    const db = this.prisma as unknown as { cart: any };
    const cart = await db.cart.create({
      data: {
        customerId: input.customerId,
      },
      include: { items: true },
    });
    return this.mapToDomain(cart);
  }

  async findById(id: string): Promise<Cart | null> {
    const db = this.prisma as unknown as { cart: any };
    const cart = await db.cart.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!cart) return null;
    return this.mapToDomain(cart);
  }

  async findByCustomer(customerId: string): Promise<Cart | null> {
    const db = this.prisma as unknown as { cart: any };
    const cart = await db.cart.findUnique({
      where: { customerId },
      include: { items: true },
    });
    if (!cart) return null;
    return this.mapToDomain(cart);
  }

  async addItem(input: AddCartItemInput): Promise<CartItem> {
    const db = this.prisma as unknown as { cartItem: any };
    const item = await db.cartItem.upsert({
      where: {
        cartId_formulationId: {
          cartId: input.cartId,
          formulationId: input.formulationId,
        },
      },
      create: {
        cartId: input.cartId,
        formulationId: input.formulationId,
        quantity: input.quantity,
      },
      update: {
        quantity: { increment: input.quantity },
      },
    });
    return this.mapItemToDomain(item);
  }

  async updateItem(input: UpdateCartItemInput): Promise<CartItem> {
    const db = this.prisma as unknown as { cartItem: any };
    const item = await db.cartItem.update({
      where: { id: input.itemId },
      data: { quantity: input.quantity },
    });
    return this.mapItemToDomain(item);
  }

  async removeItem(input: RemoveCartItemInput): Promise<void> {
    const db = this.prisma as unknown as { cartItem: any };
    await db.cartItem.delete({
      where: { id: input.itemId },
    });
  }

  async clear(cartId: string): Promise<void> {
    const db = this.prisma as unknown as { cartItem: any };
    await db.cartItem.deleteMany({
      where: { cartId },
    });
  }

  async markCheckedOut(cartId: string): Promise<void> {
    await this.clear(cartId);
  }

  private mapToDomain(c: any): Cart {
    return {
      id: c.id,
      customerId: c.customerId,
      items: c.items?.map((item: any) => this.mapItemToDomain(item)) ?? [],
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  private mapItemToDomain(item: any): CartItem {
    return {
      id: item.id,
      cartId: item.cartId,
      formulationId: item.formulationId,
      quantity: item.quantity,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}