import { DomainError } from '@gq/contracts';
export class InsufficientStockError extends DomainError { 
  override readonly context: { needed: number; available: number; formulationId: string; darkStoreId: string } | undefined;
  constructor(message: string, context?: { needed: number; available: number; formulationId: string; darkStoreId: string }) { 
    super(message, 'INSUFFICIENT_STOCK', context); 
    this.context = context;
  } 
}