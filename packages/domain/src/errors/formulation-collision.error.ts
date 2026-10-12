import { DomainError } from '@gq/contracts';
export class FormulationFingerprintCollisionError extends DomainError { 
  constructor(message: string, public readonly existingFormulationId: string) { 
    super(message, 'FORMULATION_FINGERPRINT_COLLISION', { existingFormulationId }); 
  } 
}