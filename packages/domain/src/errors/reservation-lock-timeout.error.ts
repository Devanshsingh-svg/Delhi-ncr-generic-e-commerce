import { DomainError } from '@gq/contracts';
export class ReservationLockTimeoutError extends DomainError { constructor(message: string) { super(message, 'RESERVATION_LOCK_TIMEOUT'); } }