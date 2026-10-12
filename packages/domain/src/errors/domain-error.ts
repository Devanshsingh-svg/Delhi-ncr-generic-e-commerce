// R7-11: Single DomainError in @gq/domain; contracts re-exports it
export class DomainError extends Error {
  constructor(message: string, public readonly code: string, public readonly context?: Record<string, unknown>) {
    super(message);
    this.name = 'DomainError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}