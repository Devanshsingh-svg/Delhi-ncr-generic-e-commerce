import { describe, it, expect } from 'vitest';
import { money, moneyZero, moneyAdd, moneySub, moneyMul, moneyDiv, moneyCmp, moneyGt, moneyGte, moneyLt, moneyLte, moneyEq } from '../src/domain/money';

describe('Money', () => {
  it('rejects negative', () => expect(() => money('-10.00')).toThrow('Money cannot be negative'));
  it('enforces 2 decimals', () => { expect(money('10.5')).toBe('10.50'); expect(money('10')).toBe('10.00'); });
  it('moneyZero', () => expect(moneyZero()).toBe('0.00'));
  it('arithmetic', () => { expect(moneyAdd('10.00', '5.50')).toBe('15.50'); expect(moneySub('10.00', '3.50')).toBe('6.50'); expect(() => moneySub('5.00', '10.00')).toThrow(); expect(moneyMul('10.00', 2)).toBe('20.00'); expect(moneyDiv('10.00', 2)).toBe('5.00'); expect(() => moneyDiv('10.00', 0)).toThrow(); });
  it('comparisons', () => { expect(moneyCmp('10.00', '5.00')).toBe(1); expect(moneyGt('10.00', '5.00')).toBe(true); expect(moneyEq('10.00', '10.00')).toBe(true); });
});