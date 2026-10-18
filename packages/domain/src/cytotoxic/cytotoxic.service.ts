import {
  CytotoxicDrug,
  CreateCytotoxicDrugInput,
  CytotoxicHandling,
  CytotoxicHandlingLevel,
} from './cytotoxic.entity';
import {
  CytotoxicDrugNotFoundError,
  CytotoxicHandlingValidationError,
} from './cytotoxic.errors';
import { CytotoxicPersistencePort } from './cytotoxic.port';

export interface ValidateCytotoxicHandlingInput {
  formulationId: string;
  handling: CytotoxicHandling;
  handlingLevel?: CytotoxicHandlingLevel;
}

export interface ValidateCytotoxicHandlingResult {
  valid: boolean;
  handlingLevel: CytotoxicHandlingLevel;
  restrictions: string[];
}

export class CytotoxicHandlingService {
  private readonly port: CytotoxicPersistencePort;

  constructor(port: CytotoxicPersistencePort) {
    this.port = port;
  }

  validateHandling(input: ValidateCytotoxicHandlingInput): ValidateCytotoxicHandlingResult {
    const { handling, handlingLevel = CytotoxicHandlingLevel.STANDARD } = input;
    const restrictions: string[] = [];

    if (handlingLevel === CytotoxicHandlingLevel.MAXIMUM && !handling.ppeRequired) {
      throw new CytotoxicHandlingValidationError(
        input.formulationId,
        'ppeRequired',
        'PPE is required for maximum handling level',
      );
    }

    if (handling.ppeRequired) restrictions.push('PPE required');
    if (handling.segregatedStorage) restrictions.push('Segregated storage required');
    if (handling.pregnantWomanHandling) restrictions.push('Pregnant-woman handling restrictions apply');

    return {
      valid: true,
      handlingLevel,
      restrictions,
    };
  }

  async createCytotoxicDrug(input: CreateCytotoxicDrugInput): Promise<CytotoxicDrug> {
    this.validateHandling({
      formulationId: input.formulationId,
      handling: input.cytotoxicHandling,
    });

    if (input.cytotoxicHandling.ppeRequired && !input.specialStorageRequired) {
      throw new CytotoxicHandlingValidationError(
        input.formulationId,
        'specialStorageRequired',
        'Special storage is required when PPE is required',
      );
    }

    return this.port.create(input);
  }

  async findCytotoxicDrugByFormulationId(formulationId: string): Promise<CytotoxicDrug | null> {
    return this.port.findByFormulationId(formulationId);
  }

  async updateHandling(formulationId: string, handling: CytotoxicHandling): Promise<void> {
    const existing = await this.port.findByFormulationId(formulationId);
    if (!existing) {
      throw new CytotoxicDrugNotFoundError(formulationId);
    }

    this.validateHandling({ formulationId, handling });

    await this.port.updateHandling(existing.id, handling);
  }

  async verifyHandlingRestrictions(formulationId: string): Promise<{ compliant: boolean; missing: string[] }> {
    const drug = await this.port.findByFormulationId(formulationId);
    if (!drug) {
      throw new CytotoxicDrugNotFoundError(formulationId);
    }

    const missing: string[] = [];
    if (drug.cytotoxicHandling.ppeRequired && !drug.specialStorageRequired) {
      missing.push('specialStorageRequired');
    }
    if (drug.cytotoxicHandling.pregnantWomanHandling && !drug.handlingRestrictions.includes('pregnant-woman')) {
      missing.push('pregnant-woman handling restriction');
    }

    return {
      compliant: missing.length === 0,
      missing,
    };
  }
}
