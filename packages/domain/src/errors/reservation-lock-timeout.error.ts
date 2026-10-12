import { DomainError } from './domain-error';
export class ReservationLockTimeoutError extends DomainError { constructor(message: string) { super(message, 'RESERVATION_LOCK_TIMEOUT'); } }