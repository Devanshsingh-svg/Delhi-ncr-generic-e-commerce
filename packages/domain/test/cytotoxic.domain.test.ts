import { describe, it, expect, vi } from 'vitest';
import {
  CytotoxicDrugNotFoundError,
  CytotoxicHandlingValidationError,
  CytotoxicStorageConflictError,
} from '../src/cytotoxic/cytotoxic.errors';
import {
  CytotoxicHandling,
  CytotoxicHandlingLevel,
} from '../src/cytotoxic/cytotoxic.entity';

describe('Cytotoxic domain errors', () => {
  it('CytotoxicDrugNotFoundError has correct code and context', () => {
    const err = new CytotoxicDrugNotFoundError('formulation-1');
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe('CYTOTOXIC_DRUG_NOT_FOUND');
    expect(err.name).toBe('CytotoxicDrugNotFoundError');
    expect((err as any).context.formulationId).toBe('formulation-1');
  });

  it('CytotoxicHandlingValidationError has correct code and context', () => {
    const err = new CytotoxicHandlingValidationError('formulation-1', 'ppeRequired', 'PPE is required for cytotoxic drugs');
    expect(err.code).toBe('CYTOTOXIC_HANDLING_VALIDATION_ERROR');
    expect(err.name).toBe('CytotoxicHandlingValidationError');
    expect((err as any).context.formulationId).toBe('formulation-1');
    expect((err as any).context.field).toBe('ppeRequired');
  });

  it('CytotoxicStorageConflictError has correct code and context', () => {
    const err = new CytotoxicStorageConflictError('formulation-1', 'segregated_storage_unavailable');
    expect(err.code).toBe('CYTOTOXIC_STORAGE_CONFLICT');
    expect(err.name).toBe('CytotoxicStorageConflictError');
    expect((err as any).context.conflictType).toBe('segregated_storage_unavailable');
  });
});

describe('CytotoxicHandlingLevel enum', () => {
  it('exports expected handling levels', () => {
    expect(CytotoxicHandlingLevel.STANDARD).toBe('STANDARD');
    expect(CytotoxicHandlingLevel.ELEVATED).toBe('ELEVATED');
    expect(CytotoxicHandlingLevel.MAXIMUM).toBe('MAXIMUM');
  });
});

describe('CytotoxicHandling interface shape', () => {
  it('valid cytotoxic handling object matches interface', () => {
    const handling: CytotoxicHandling = {
      ppeRequired: true,
      segregatedStorage: true,
      pregnantWomanHandling: false,
    };
    expect(handling.ppeRequired).toBe(true);
    expect(handling.segregatedStorage).toBe(true);
    expect(handling.pregnantWomanHandling).toBe(false);
  });

  it('cytotoxic handling without PPE is still valid type', () => {
    const handling: CytotoxicHandling = {
      ppeRequired: false,
      segregatedStorage: true,
      pregnantWomanHandling: true,
    };
    expect(handling.ppeRequired).toBe(false);
    expect(handling.segregatedStorage).toBe(true);
    expect(handling.pregnantWomanHandling).toBe(true);
  });
});
