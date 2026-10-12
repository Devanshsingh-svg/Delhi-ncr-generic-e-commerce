export type Result<T, E = DomainError> = { ok: true; value: T } | { ok: false; error: E };

export class DomainError extends Error {
  constructor(message: string, public readonly code: string, public readonly context?: Record<string, unknown>) { super(message); this.name = 'DomainError'; }
}

export function ok<T>(value: T): Result<T, never> { return { ok: true, value }; }
export function err<E extends DomainError>(error: E): Result<never, E> { return { ok: false, error }; }
export function isOk<T, E>(r: Result<T, E>): r is { ok: true; value: T } { return r.ok; }
export function isErr<T, E>(r: Result<T, E>): r is { ok: false; error: E } { return !r.ok; }
export function unwrap<T, E>(r: Result<T, E>): T { if (!r.ok) throw r.error; return r.value; }
export function unwrapErr<T, E>(r: Result<T, E>): E { if (r.ok) throw new Error('Expected error'); return r.error; }
export function map<T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> { return r.ok ? ok(fn(r.value)) : r; }
export function mapErr<T, E extends DomainError, F extends DomainError>(r: Result<T, E>, fn: (e: E) => F): Result<T, F> { return r.ok ? ok(r.value) as Result<T, F> : err(fn(r.error)); }
export function andThen<T, U, E extends DomainError>(r: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> { return r.ok ? fn(r.value) : r; }