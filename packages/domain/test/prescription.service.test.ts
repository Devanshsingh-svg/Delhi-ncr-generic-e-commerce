import { describe, it, expect, vi } from 'vitest';
import { PrescriptionService } from '../src/prescription/prescription.service';
import {
  PrescriptionNotFoundError,
  PrescriptionAlreadyVerifiedError,
  PrescriptionAlreadyRejectedError,
  PrescriptionExpiredError,
  PharmacistNotAuthorizedError,
} from '../src/prescription/prescription.errors';
import { PrescriptionStatus } from '../src/prescription/prescription.entity';

const makeMockPort = () => ({
  create: vi.fn(),
  findById: vi.fn(),
  findByCustomer: vi.fn(),
  verify: vi.fn(),
  updateStatus: vi.fn(),
});

describe('PrescriptionService', () => {
  describe('validateForDispense', () => {
    it('returns invalid when prescription not found', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(null);
      const service = new PrescriptionService(port as any);
      const result = await service.validateForDispense('missing');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Prescription not found');
    });

    it('returns invalid when rejected', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue({ id: 'p1', status: PrescriptionStatus.REJECTED, expiresAt: null });
      const service = new PrescriptionService(port as any);
      const result = await service.validateForDispense('p1');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Prescription rejected');
    });

    it('returns valid when active and not expired', async () => {
      const port = makeMockPort();
      const future = new Date(Date.now() + 86400000);
      port.findById.mockResolvedValue({ id: 'p1', status: PrescriptionStatus.ACTIVE, expiresAt: future });
      const service = new PrescriptionService(port as any);
      const result = await service.validateForDispense('p1');
      expect(result.valid).toBe(true);
      expect(result.reason).toBe(null);
    });

    it('returns invalid when active and expired', async () => {
      const port = makeMockPort();
      const past = new Date(Date.now() - 86400000);
      port.findById.mockResolvedValue({ id: 'p1', status: PrescriptionStatus.ACTIVE, expiresAt: past });
      const service = new PrescriptionService(port as any);
      const result = await service.validateForDispense('p1');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Prescription past validity window');
    });
  });

  describe('create', () => {
    it('throws when expiry is not after issue date', async () => {
      const port = makeMockPort();
      const service = new PrescriptionService(port as any);
      await expect(service.create({
        customerId: 'c1',
        prescriber: 'Dr. Smith',
        issuedAt: new Date('2026-01-01'),
        expiresAt: new Date('2025-01-01'),
        items: [{ formulationId: 'f1', quantity: 2 }],
      })).rejects.toThrow('Expiry must be after issue date');
    });

    it('creates prescription through port', async () => {
      const port = makeMockPort();
      const created = { id: 'p1', customerId: 'c1', prescriber: 'Dr. Smith', items: [] };
      port.create.mockResolvedValue(created);
      const service = new PrescriptionService(port as any);
      const result = await service.create({
        customerId: 'c1',
        prescriber: 'Dr. Smith',
        issuedAt: new Date('2026-01-01'),
        expiresAt: new Date('2026-07-01'),
        items: [{ formulationId: 'f1', quantity: 2 }],
      });
      expect(port.create).toHaveBeenCalledWith({
        customerId: 'c1',
        prescriber: 'Dr. Smith',
        issuedAt: new Date('2026-01-01'),
        expiresAt: new Date('2026-07-01'),
        items: [{ formulationId: 'f1', quantity: 2 }],
      });
      expect(result).toEqual(created);
    });
  });

  describe('verify', () => {
    it('throws PrescriptionNotFoundError when missing', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue(null);
      const service = new PrescriptionService(port as any);
      await expect(service.verify({
        prescriptionId: 'missing',
        pharmacistId: 'ph1',
        decision: 'VERIFIED',
        notes: null,
      })).rejects.toBeInstanceOf(PrescriptionNotFoundError);
    });

    it('throws PrescriptionAlreadyVerifiedError when already verified', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue({ id: 'p1', status: PrescriptionStatus.VERIFIED, expiresAt: null });
      const service = new PrescriptionService(port as any);
      await expect(service.verify({
        prescriptionId: 'p1',
        pharmacistId: 'ph1',
        decision: 'VERIFIED',
        notes: null,
      })).rejects.toBeInstanceOf(PrescriptionAlreadyVerifiedError);
    });

    it('throws PrescriptionAlreadyRejectedError when already rejected', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue({ id: 'p1', status: PrescriptionStatus.REJECTED, expiresAt: null });
      const service = new PrescriptionService(port as any);
      await expect(service.verify({
        prescriptionId: 'p1',
        pharmacistId: 'ph1',
        decision: 'VERIFIED',
        notes: null,
      })).rejects.toBeInstanceOf(PrescriptionAlreadyRejectedError);
    });

    it('throws PrescriptionExpiredError when expired', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue({ id: 'p1', status: PrescriptionStatus.EXPIRED, expiresAt: new Date('2026-01-01') });
      const service = new PrescriptionService(port as any);
      await expect(service.verify({
        prescriptionId: 'p1',
        pharmacistId: 'ph1',
        decision: 'VERIFIED',
        notes: null,
      })).rejects.toBeInstanceOf(PrescriptionExpiredError);
    });

    it('throws PharmacistNotAuthorizedError when no pharmacistId', async () => {
      const port = makeMockPort();
      port.findById.mockResolvedValue({ id: 'p1', status: PrescriptionStatus.ACTIVE, expiresAt: null });
      const service = new PrescriptionService(port as any);
      await expect(service.verify({
        prescriptionId: 'p1',
        pharmacistId: '',
        decision: 'VERIFIED',
        notes: null,
      })).rejects.toBeInstanceOf(PharmacistNotAuthorizedError);
    });

    it('verifies prescription through port', async () => {
      const port = makeMockPort();
      const verified = { id: 'p1', status: PrescriptionStatus.VERIFIED, pharmacistId: 'ph1' };
      port.findById.mockResolvedValue({ id: 'p1', status: PrescriptionStatus.ACTIVE, expiresAt: null });
      port.verify.mockResolvedValue(verified);
      const service = new PrescriptionService(port as any);
      const result = await service.verify({
        prescriptionId: 'p1',
        pharmacistId: 'ph1',
        decision: 'VERIFIED',
        notes: 'Looks good',
      });
      expect(port.verify).toHaveBeenCalledWith({
        prescriptionId: 'p1',
        pharmacistId: 'ph1',
        decision: 'VERIFIED',
        notes: 'Looks good',
      });
      expect(result).toEqual(verified);
    });
  });
});
