/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, Get } from '@nestjs/common';

import { CatalogItemsResponseSchema } from '@gq/contracts';

import { PrismaService } from '../../prisma/prisma.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('items')
  async listItems() {
    const db = this.prisma as unknown as { formulation: any };
    const formulations: any[] = await db.formulation.findMany({
      include: {
        Molecule: true,
        brandMedicines: { include: { manufacturer: true, regulatorySchedule: true } },
        InventoryBatch: {
          where: { expiryDate: { gte: new Date() } },
          select: { availableQty: true },
        },
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    const items: unknown[] = [];
    for (const f of formulations) {
      const brand = f.brandMedicines?.[0];
      if (!brand) continue;
      const mrp = f.mrp !== null && f.mrp !== undefined ? Number(f.mrp) : null;
      const altMrp = f.altMrp !== null && f.altMrp !== undefined ? Number(f.altMrp) : null;
      const savingsPct =
        mrp !== null && altMrp !== null && altMrp > 0 && altMrp > mrp
          ? Math.round((1 - mrp / altMrp) * 100)
          : null;
      items.push({
        formulationId: f.id,
        brandName: brand.brandName,
        moleculeInn: f.Molecule?.inn ?? 'unlinked',
        dosageForm: f.dosageForm,
        strength: f.strength,
        releaseType: f.releaseType,
        manufacturerName: brand.manufacturer.name,
        regulatoryCode: brand.regulatorySchedule.code,
        regulatoryLabel: brand.regulatorySchedule.label,
        availableQty: (f.InventoryBatch as { availableQty: number }[]).reduce(
          (sum, b) => sum + b.availableQty,
          0,
        ),
        isTopSeller: f.isTopSeller,
        mrp,
        altBrandName: f.altBrandName ?? null,
        altMrp,
        altEstimated: f.altEstimated,
        savingsPct,
      });
    }

    return { success: true, data: CatalogItemsResponseSchema.parse(items) };
  }
}