/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';

import {
  PrescriptionPersistencePort,
  CreatePrescriptionInput,
  VerifyPrescriptionInput,
  Prescription,
} from '@gq/domain';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaPrescriptionRepository implements PrescriptionPersistencePort {
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async create(input: CreatePrescriptionInput): Promise<Prescription> {
    const db = this.prisma as unknown as { prescription: any; pharmacistReview: any };
    const created = await db.prescription.create({
      data: {
        customerId: input.customerId,
        prescriber: input.prescriber,
        issuedAt: input.issuedAt,
        expiresAt: input.expiresAt,
        status: 'ACTIVE',
      },
    });
    return this.mapToDomain(created);
  }

  async findById(id: string): Promise<Prescription | null> {
    const db = this.prisma as unknown as { prescription: any; pharmacistReview: any };
    const found = await db.prescription.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!found) return null;
    return this.mapToDomain(found);
  }

  async findByCustomer(customerId: string): Promise<Prescription[]> {
    const db = this.prisma as unknown as { prescription: any; pharmacistReview: any };
    const found = await db.prescription.findMany({
      where: { customerId },
      include: { items: true },
    });
    return found.map((p: any) => this.mapToDomain(p));
  }

  async verify(input: VerifyPrescriptionInput): Promise<Prescription> {
    const db = this.prisma as unknown as { prescription: any; pharmacistReview: any };
    const updated = await db.prescription.update({
      where: { id: input.prescriptionId },
      data: {
        status: input.decision === 'VERIFIED' ? 'VERIFIED' : 'REJECTED',
      },
    });
    await db.pharmacistReview.create({
      data: {
        prescriptionId: input.prescriptionId,
        pharmacistId: input.pharmacistId,
        reviewDecision: input.decision,
        reviewedAt: new Date(),
      },
    });
    return this.mapToDomain(updated);
  }

  async updateStatus(id: string, status: Prescription['status']): Promise<void> {
    const db = this.prisma as unknown as { prescription: any; pharmacistReview: any };
    await db.prescription.update({ where: { id }, data: { status } });
  }

  private mapToDomain(p: any): Prescription {
    return {
      id: p.id,
      customerId: p.customerId,
      rxNumber: p.rxNumber,
      prescriber: p.prescriber,
      issuedAt: p.issuedAt,
      expiresAt: p.expiresAt,
      status: p.status,
      pharmacistId: p.review?.pharmacistId ?? null,
      reviewedAt: p.review?.reviewedAt ?? null,
      items: (p.items ?? []).map((i: any) => ({
        id: i.id,
        prescriptionId: i.prescriptionId,
        formulationId: i.formulationId,
        quantity: i.quantity,
      })),
    };
  }
}
