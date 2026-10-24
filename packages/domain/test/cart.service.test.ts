import { describe, it, expect, vi } from 'vitest';
import { CartService } from '../src/cart/cart.service';
import {
  CartNotFoundError,
  CartItemNotFoundError,
  InvalidCartItemQuantityError,
  CartOwnershipError,
} from '../src/cart/cart.errors';
import { Cart, CartItem } from '../src/cart/cart.entity';

const now = new Date('2026-01-01T00:00:00Z');

const makeItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 'item-1',
  cartId: 'cart-1',
  formulationId: 'f1',
  quantity: 1,
  createdAt: now,
  updatedAt: now,
  ...overrides,
});

const makeCart = (overrides: Partial<Cart> = {}): Cart => ({
  id: 'cart-1',
  customerId: 'c1',
  items: [],
  createdAt: now,
  updatedAt: now,
  ...overrides,
});

const makeMockPort = () => ({
  create: vi.fn(),
  findById: vi.fn(),
  findByCustomer: vi.fn(),
  addItem: vi.fn(),
  updateItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  markCheckedOut: vi.fn(),
});

describe('CartService', () => {
  describe('getOrCreateCart', () => {
    it('creates a cart when the customer has none', async () => {
      const port = makeMockPort();
      const created = makeCart();
      port.findByCustomer.mockResolvedValue(null);
      port.create.mockResolvedValue(created);
      const service = new CartService(port as any);
      const result = await service.getOrCreateCart('c1');
      expect(port.create).toHaveBeenCalledWith({ customerId: 'c1' });
      expect(result).toEqual(created);
    });

    it('returns the existing cart without creating a duplicate', async () => {
      const port = makeMockPort();
      const existing = makeCart();
      port.findByCustomer.mockResolvedValue(existing);
      const service = new CartService(port as any);
      const result = await service.getOrCreateCart('c1');
      expect(port.create).not.toHaveBeenCalled();
      expect(result).toEqual(existing);
    });
  });

  describe('addItem', () => {
    it('adds a new item through the port', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(makeCart());
      const item = makeItem({ quantity: 2 });
      port.addItem.mockResolvedValue(item);
      const service = new CartService(port as any);
      const result = await service.addItem({ cartId: 'cart-1', formulationId: 'f1', quantity: 2 });
      expect(port.addItem).toHaveBeenCalledWith({ cartId: 'cart-1', formulationId: 'f1', quantity: 2 });
      expect(result).toEqual(item);
    });

    it('merges quantity when the formulation is already in the cart', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(makeCart({ items: [makeItem({ quantity: 2 })] }));
      const merged = makeItem({ quantity: 5 });
      port.updateItem.mockResolvedValue(merged);
      const service = new CartService(port as any);
      const result = await service.addItem({ cartId: 'cart-1', formulationId: 'f1', quantity: 3 });
      expect(port.updateItem).toHaveBeenCalledWith({ cartId: 'cart-1', itemId: 'item-1', quantity: 5 });
      expect(result).toEqual(merged);
    });

    it('throws when merged quantity exceeds the item maximum', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(makeCart({ items: [makeItem({ quantity: 99 })] }));
      const service = new CartService(port as any);
      await expect(service.addItem({ cartId: 'cart-1', formulationId: 'f1', quantity: 1 }))
        .rejects.toBeInstanceOf(InvalidCartItemQuantityError);
    });

    it('throws on non-positive quantity', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(makeCart());
      const service = new CartService(port as any);
      await expect(service.addItem({ cartId: 'cart-1', formulationId: 'f1', quantity: 0 }))
        .rejects.toBeInstanceOf(InvalidCartItemQuantityError);
    });

    it('throws when the cart already has 50 distinct items', async () => {
      const port = makeMockPort();
      const items = Array.from({ length: 50 }, (_, i) =>
        makeItem({ id: `item-${i}`, formulationId: `f${i}` }),
      );
      port.findById.mockResolvedValue(makeCart({ items }));
      const service = new CartService(port as any);
      await expect(service.addItem({ cartId: 'cart-1', formulationId: 'f-new', quantity: 1 }))
        .rejects.toBeInstanceOf(InvalidCartItemQuantityError);
    });

    it('throws when the cart does not exist', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(null);
      const service = new CartService(port as any);
      await expect(service.addItem({ cartId: 'missing', formulationId: 'f1', quantity: 1 }))
        .rejects.toBeInstanceOf(CartNotFoundError);
    });
  });

  describe('updateItem', () => {
    it('updates quantity through the port', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(makeCart({ items: [makeItem()] }));
      const updated = makeItem({ quantity: 7 });
      port.updateItem.mockResolvedValue(updated);
      const service = new CartService(port as any);
      const result = await service.updateItem({ cartId: 'cart-1', itemId: 'item-1', quantity: 7 });
      expect(port.updateItem).toHaveBeenCalledWith({ cartId: 'cart-1', itemId: 'item-1', quantity: 7 });
      expect(result).toEqual(updated);
    });

    it('throws when the item is not in the cart', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(makeCart());
      const service = new CartService(port as any);
      await expect(service.updateItem({ cartId: 'cart-1', itemId: 'nope', quantity: 1 }))
        .rejects.toBeInstanceOf(CartItemNotFoundError);
    });

    it('throws on non-positive quantity', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(makeCart({ items: [makeItem()] }));
      const service = new CartService(port as any);
      await expect(service.updateItem({ cartId: 'cart-1', itemId: 'item-1', quantity: 0 }))
        .rejects.toBeInstanceOf(InvalidCartItemQuantityError);
    });
  });

  describe('removeItem', () => {
    it('removes through the port', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(makeCart({ items: [makeItem()] }));
      port.removeItem.mockResolvedValue(undefined);
      const service = new CartService(port as any);
      await service.removeItem({ cartId: 'cart-1', itemId: 'item-1' });
      expect(port.removeItem).toHaveBeenCalledWith({ cartId: 'cart-1', itemId: 'item-1' });
    });

    it('throws when the item is not in the cart', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(makeCart());
      const service = new CartService(port as any);
      await expect(service.removeItem({ cartId: 'cart-1', itemId: 'nope' }))
        .rejects.toBeInstanceOf(CartItemNotFoundError);
    });
  });

  describe('clearCart', () => {
    it('clears through the port', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(makeCart({ items: [makeItem()] }));
      port.clear.mockResolvedValue(undefined);
      const service = new CartService(port as any);
      await service.clearCart('cart-1');
      expect(port.clear).toHaveBeenCalledWith('cart-1');
    });

    it('throws when the cart does not exist', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(null);
      const service = new CartService(port as any);
      await expect(service.clearCart('missing')).rejects.toBeInstanceOf(CartNotFoundError);
    });
  });

  describe('checkout', () => {
    it('marks a non-empty cart as checked out', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(makeCart({ items: [makeItem()] }));
      port.markCheckedOut.mockResolvedValue(undefined);
      const service = new CartService(port as any);
      await service.checkout('cart-1');
      expect(port.markCheckedOut).toHaveBeenCalledWith('cart-1');
    });

    it('throws on an empty cart', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(makeCart());
      const service = new CartService(port as any);
      await expect(service.checkout('cart-1')).rejects.toBeInstanceOf(InvalidCartItemQuantityError);
    });
  });

  describe('verifyOwnership', () => {
    it('passes when the customer owns the cart', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(makeCart());
      const service = new CartService(port as any);
      await expect(service.verifyOwnership('cart-1', 'c1')).resolves.toBeUndefined();
    });

    it('throws on ownership mismatch', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(makeCart());
      const service = new CartService(port as any);
      await expect(service.verifyOwnership('cart-1', 'someone-else'))
        .rejects.toBeInstanceOf(CartOwnershipError);
    });
  });

  describe('getCartTotals', () => {
    it('counts items and total quantity', () => {
      const cart = makeCart({
        items: [makeItem({ quantity: 2 }), makeItem({ id: 'item-2', formulationId: 'f2', quantity: 3 })],
      });
      const service = new CartService(makeMockPort() as any);
      expect(service.getCartTotals(cart)).toEqual({ itemCount: 2, totalQuantity: 5 });
    });
  });
});