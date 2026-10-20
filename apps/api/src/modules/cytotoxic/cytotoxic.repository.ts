/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';

import {
  CytotoxicPersistencePort,
  CreateCytotoxicDrugInput,
} from '@gq/domain';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaCytotoxicRepository implements CytotoxicPersistencePort {
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async create(input: CreateCytotoxicDrugInput) {
    const db = this.prisma as unknown as { cytotoxicDrug: any };
    const cytotoxic = await db.cytotoxicDrug.create({
      data: {
        formulationId: input.formulationId,
        ppeRequired: input.cytotoxicHandling.ppeRequired,
        segregatedStorage: input.cytotoxicHandling.segregatedStorage,
        pregnantWomanHandling: input.cytotoxicHandling.pregnantWomanHandling,
        specialStorageRequired: input.specialStorageRequired,
        handlingRestrictions: input.handlingRestrictions,
      },
    });
    return this.mapToDomain(cytotoxic);
  }

  async findById(id: string) {
    const db = this.prisma as unknown as { cytotoxicDrug: any };
    const cytotoxic = await db.cytotoxicDrug.findUnique({ where: { id } });
    if (!cytotoxic) return null;
    return this.mapToDomain(cytotoxic);
  }

  async findByFormulationId(formulationId: string) {
    const db = this.prisma as unknown as { cytotoxicDrug: any };
    const cytotoxic = await db.cytotoxicDrug.findUnique({ where: { formulationId } });
    if (!cytotoxic) return null;
    return this.mapToDomain(cytotoxic);
  }

  async updateHandling(id: string, handling: any): Promise<void> {
    const db = this.prisma as unknown as { cytotoxicDrug: any };
    await db.cytotoxicDrug.update({
      where: { id },
      data: {
        ppeRequired: handling.ppeRequired,
        segregatedStorage: handling.segregatedStorage,
        pregnantWomanHandling: handling.pregnantWomanHandling,
      },
    });
  }

  async updateStorage(id: string, specialStorageRequired: boolean): Promise<void> {
    const db = this.prisma as unknown as { cytotoxicDrug: any };
    await db.cytotoxicDrug.update({
      where: { id },
      data: { specialStorageRequired },
    });
  }

  async delete(id: string) {
    const db = this.prisma as unknown as { cytotoxicDrug: any };
    await db.cytotoxicDrug.delete({ where: { id } });
  }

  private mapToDomain(c: any) {
    return {
      id: c.id,
      formulationId: c.formulationId,
      cytotoxicHandling: {
        ppeRequired: c.ppeRequired,
        segregatedStorage: c.segregatedStorage,
        pregnantWomanHandling: c.pregnantWomanHandling,
      },
      specialStorageRequired: c.specialStorageRequired,
      handlingRestrictions: c.handlingRestrictions,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}
