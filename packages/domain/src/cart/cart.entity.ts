export interface CartItem {
  id: string;
  cartId: string;
  formulationId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string;
  customerId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCartInput {
  customerId: string;
}

export interface AddCartItemInput {
  cartId: string;
  formulationId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  cartId: string;
  itemId: string;
  quantity: number;
}

export interface RemoveCartItemInput {
  cartId: string;
  itemId: string;
}