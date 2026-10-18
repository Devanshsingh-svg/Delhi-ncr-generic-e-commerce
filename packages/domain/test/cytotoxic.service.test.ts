import { describe, it, expect, vi } from 'vitest';
import { CytotoxicHandlingService } from '../src/cytotoxic/cytotoxic.service';
import {
  CytotoxicHandlingValidationError,
  CytotoxicDrugNotFoundError,
} from '../src/cytotoxic/cytotoxic.errors';
import { CytotoxicHandlingLevel } from '../src/cytotoxic/cytotoxic.entity';

const makeMockPort = () => ({
  create: vi.fn(),
  findById: vi.fn(),
  findByFormulationId: vi.fn(),
  updateHandling: vi.fn(),
  updateStorage: vi.fn(),
  delete: vi.fn(),
});

describe('CytotoxicHandlingService', () => {
  describe('validateHandling', () => {
    it('returns valid for standard handling with PPE', () => {
      const port = makeMockPort();
      const service = new CytotoxicHandlingService(port as any);
      const result = service.validateHandling({
        formulationId: 'f1',
        handling: { ppeRequired: true, segregatedStorage: false, pregnantWomanHandling: false },
        handlingLevel: CytotoxicHandlingLevel.STANDARD,
      });
      expect(result.valid).toBe(true);
      expect(result.handlingLevel).toBe(CytotoxicHandlingLevel.STANDARD);
      expect(result.restrictions).toContain('PPE required');
    });

    it('throws when MAXIMUM level without PPE', () => {
      const port = makeMockPort();
      const service = new CytotoxicHandlingService(port as any);
      expect(() => service.validateHandling({
        formulationId: 'f1',
        handling: { ppeRequired: false, segregatedStorage: true, pregnantWomanHandling: false },
        handlingLevel: CytotoxicHandlingLevel.MAXIMUM,
      })).toThrow(CytotoxicHandlingValidationError);
    });

    it('allows segregated storage and pregnant-woman handling together', () => {
      const port = makeMockPort();
      const service = new CytotoxicHandlingService(port as any);
      const result = service.validateHandling({
        formulationId: 'f1',
        handling: { ppeRequired: true, segregatedStorage: true, pregnantWomanHandling: true },
        handlingLevel: CytotoxicHandlingLevel.MAXIMUM,
      });
      expect(result.valid).toBe(true);
      expect(result.handlingLevel).toBe(CytotoxicHandlingLevel.MAXIMUM);
      expect(result.restrictions).toContain('PPE required');
      expect(result.restrictions).toContain('Segregated storage required');
      expect(result.restrictions).toContain('Pregnant-woman handling restrictions apply');
    });

    it('returns all applicable restrictions', () => {
      const port = makeMockPort();
      const service = new CytotoxicHandlingService(port as any);
      const result = service.validateHandling({
        formulationId: 'f1',
        handling: { ppeRequired: true, segregatedStorage: true, pregnantWomanHandling: true },
      });
      expect(result.restrictions).toContain('PPE required');
      expect(result.restrictions).toContain('Segregated storage required');
      expect(result.restrictions).toContain('Pregnant-woman handling restrictions apply');
    });
  });

  describe('createCytotoxicDrug', () => {
    it('creates cytotoxic drug through port with valid handling', async () => {
      const port = makeMockPort();
      const service = new CytotoxicHandlingService(port as any);
      const created = { id: 'cd1', formulationId: 'f1' };
      port.create.mockResolvedValue(created);
      port.findByFormulationId.mockResolvedValue(null);

      const result = await service.createCytotoxicDrug({
        formulationId: 'f1',
        cytotoxicHandling: { ppeRequired: true, segregatedStorage: true, pregnantWomanHandling: false },
        specialStorageRequired: true,
        handlingRestrictions: ['pregnant-woman'],
      });

      expect(port.create).toHaveBeenCalledWith({
        formulationId: 'f1',
        cytotoxicHandling: { ppeRequired: true, segregatedStorage: true, pregnantWomanHandling: false },
        specialStorageRequired: true,
        handlingRestrictions: ['pregnant-woman'],
      });
      expect(result).toEqual(created);
    });

    it('throws when PPE required but special storage not required', async () => {
      const port = makeMockPort();
      const service = new CytotoxicHandlingService(port as any);
      port.findByFormulationId.mockResolvedValue(null);

      await expect(service.createCytotoxicDrug({
        formulationId: 'f1',
        cytotoxicHandling: { ppeRequired: true, segregatedStorage: false, pregnantWomanHandling: false },
        specialStorageRequired: false,
        handlingRestrictions: [],
      })).rejects.toThrow(CytotoxicHandlingValidationError);
    });
  });

  describe('findCytotoxicDrugByFormulationId', () => {
    it('returns cytotoxic drug when found', async () => {
      const port = makeMockPort();
      const service = new CytotoxicHandlingService(port as any);
      const drug = { id: 'cd1', formulationId: 'f1' };
      port.findByFormulationId.mockResolvedValue(drug);

      const result = await service.findCytotoxicDrugByFormulationId('f1');
      expect(port.findByFormulationId).toHaveBeenCalledWith('f1');
      expect(result).toEqual(drug);
    });

    it('returns null when not found', async () => {
      const port = makeMockPort();
      const service = new CytotoxicHandlingService(port as any);
      port.findByFormulationId.mockResolvedValue(null);

      const result = await service.findCytotoxicDrugByFormulationId('missing');
      expect(result).toBeNull();
    });
  });

  describe('updateHandling', () => {
    it('throws CytotoxicDrugNotFoundError when drug not found', async () => {
      const port = makeMockPort();
      const service = new CytotoxicHandlingService(port as any);
      port.findByFormulationId.mockResolvedValue(null);

      await expect(service.updateHandling('missing', {
        ppeRequired: true,
        segregatedStorage: false,
        pregnantWomanHandling: false,
      })).rejects.toThrow(CytotoxicDrugNotFoundError);
    });

    it('updates handling through port', async () => {
      const port = makeMockPort();
      const service = new CytotoxicHandlingService(port as any);
      const existing = { id: 'cd1', formulationId: 'f1' };
      port.findByFormulationId.mockResolvedValue(existing);
      port.updateHandling.mockResolvedValue(undefined);

      await service.updateHandling('f1', {
        ppeRequired: true,
        segregatedStorage: true,
        pregnantWomanHandling: false,
      });

      expect(port.updateHandling).toHaveBeenCalledWith('cd1', {
        ppeRequired: true,
        segregatedStorage: true,
        pregnantWomanHandling: false,
      });
    });
  });

  describe('verifyHandlingRestrictions', () => {
    it('returns compliant when all restrictions met', async () => {
      const port = makeMockPort();
      const service = new CytotoxicHandlingService(port as any);
      port.findByFormulationId.mockResolvedValue({
        id: 'cd1',
        formulationId: 'f1',
        cytotoxicHandling: { ppeRequired: true, segregatedStorage: true, pregnantWomanHandling: false },
        specialStorageRequired: true,
        handlingRestrictions: [],
      });

      const result = await service.verifyHandlingRestrictions('f1');
      expect(result.compliant).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('returns non-compliant when PPE required but special storage missing', async () => {
      const port = makeMockPort();
      const service = new CytotoxicHandlingService(port as any);
      port.findByFormulationId.mockResolvedValue({
        id: 'cd1',
        formulationId: 'f1',
        cytotoxicHandling: { ppeRequired: true, segregatedStorage: false, pregnantWomanHandling: false },
        specialStorageRequired: false,
        handlingRestrictions: [],
      });

      const result = await service.verifyHandlingRestrictions('f1');
      expect(result.compliant).toBe(false);
      expect(result.missing).toContain('specialStorageRequired');
    });

    it('throws CytotoxicDrugNotFoundError when drug not found', async () => {
      const port = makeMockPort();
      const service = new CytotoxicHandlingService(port as any);
      port.findByFormulationId.mockResolvedValue(null);

      await expect(service.verifyHandlingRestrictions('missing')).rejects.toThrow(CytotoxicDrugNotFoundError);
    });
  });
});
