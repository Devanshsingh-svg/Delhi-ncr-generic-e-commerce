import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr, unwrap, unwrapErr, map, mapErr, andThen, DomainError } from '../src/domain/result';

describe('Result', () => {
  it('ok wraps', () => { const r = ok(42); expect(isOk(r)).toBe(true); expect(unwrap(r)).toBe(42); });
  it('err wraps', () => { const e = new DomainError('fail', 'CODE'); const r = err(e); expect(isErr(r)).toBe(true); expect(unwrapErr(r)).toBe(e); });
  it('unwrap throws on err', () => expect(() => unwrap(err(new DomainError('fail', 'CODE')))).toThrow('fail'));
  it('map/andThen', () => { expect(andThen(ok(2), x => ok(x * 3)).value).toBe(6); expect(andThen(err(new DomainError('x', 'X')), x => ok(x * 3)).ok).toBe(false); });
});