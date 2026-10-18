export interface OrderItem {
  id: string;
  orderId: string;
  formulationId: string;
  quantity: number;
  unitPrice: string;
}

export interface Order {
  id: string;
  customerId: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalAmount: string;
  items: OrderItem[];
  prescriptionId: string | null;
  paymentId: string | null;
  shipmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  customerId: string;
  items: {
    formulationId: string;
    quantity: number;
  }[];
  prescriptionId: string | null;
}

export interface ConfirmOrderInput {
  orderId: string;
  paymentId: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}
