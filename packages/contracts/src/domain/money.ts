import { Decimal } from 'decimal.js';
import { z } from 'zod';

export const MoneySchema = z.string().regex(/^\d+(\.\d{1,2})?$/).brand<'Money'>();
export type Money = z.infer<typeof MoneySchema> & { __brand: 'Money' };

export function money(value: string | number | Decimal): Money {
  const d = new Decimal(value);
  if (!d.isFinite()) throw new Error('Money must be finite');
  if (d.lt(0)) throw new Error('Money cannot be negative');
  return d.toFixed(2) as Money;
}
export function moneyZero(): Money { return '0.00' as Money; }
export function moneyAdd(a: Money, b: Money): Money { return money(new Decimal(a).plus(b)); }
export function moneySub(a: Money, b: Money): Money { const r = new Decimal(a).minus(b); if (r.lt(0)) throw new Error('Money subtraction underflow'); return money(r); }
export function moneyMul(a: Money, m: number | string | Decimal): Money { return money(new Decimal(a).times(m)); }
export function moneyDiv(a: Money, d: number | string | Decimal): Money { const dv = new Decimal(d); if (dv.isZero()) throw new Error('Division by zero'); return money(new Decimal(a).div(dv)); }
export function moneyCmp(a: Money, b: Money): -1 | 0 | 1 { return new Decimal(a).cmp(b) as -1 | 0 | 1; }
export function moneyGt(a: Money, b: Money): boolean { return new Decimal(a).gt(b); }
export function moneyGte(a: Money, b: Money): boolean { return new Decimal(a).gte(b); }
export function moneyLt(a: Money, b: Money): boolean { return new Decimal(a).lt(b); }
export function moneyLte(a: Money, b: Money): boolean { return new Decimal(a).lte(b); }
export function moneyEq(a: Money, b: Money): boolean { return new Decimal(a).eq(b); }