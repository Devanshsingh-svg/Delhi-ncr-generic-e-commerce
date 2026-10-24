/**
 * seed.ts — Ingest the combined Delhi generic-medicine master into Prisma.
 *
 * Source: prisma/data/combined_generic_master.ndjson (exported from
 * Delhi_Combined_Generic_Master.xlsx). Only rows with
 * Retail_Status === 'ACTIVE_DISPATCHABLE' are ingested; blocked/unavailable
 * rows are retained in the data file but never listed.
 *
 * Idempotent: every entity is keyed by its natural unique constraint
 * (molecule inn, manufacturer name, schedule code, formulation fingerprint,
 * brand name, demo ids), so re-running is safe.
 *
 * Run from packages/db:  npx -y tsx prisma/seed.ts
 */
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_CUSTOMER_ID = '00000000-0000-4000-8000-000000000001';
const DEMO_DARK_STORE_ID = '00000000-0000-4000-8000-000000000201';
const DEMO_ADDRESS_ID = '00000000-0000-4000-8000-0000000000a1';
const DEMO_LICENSE_ID = '00000000-0000-4000-8000-0000000000d1';

const DATA_FILE = path.resolve(process.cwd(), 'prisma/data/combined_generic_master.ndjson');

interface SourceRow {
  canonical_key?: string | null;
  Medicine_Description?: string | null;
  Retail_Status?: string | null;
  Therapeutic_Class?: string | null;
  Prescription_Schedule?: string | null;
  Delhi_Surge_Profile?: string | null;
  Cheapest_Source?: string | null;
  Cheapest_Unit_Price?: number | null;
  pmbi_product_name?: string | null;
  pmbi_mrp?: number | null;
  pmbi_unit_price?: number | null;
  zeelab_brand_name?: string | null;
  zeelab_composition?: string | null;
  zeelab_mrp?: number | null;
  zeelab_unit_price?: number | null;
  tata1mg_brand_name?: string | null;
  tata1mg_composition?: string | null;
  tata1mg_mrp?: number | null;
  tata1mg_unit_price?: number | null;
  [key: string]: unknown;
}

/** Demand-flagged surge profiles count as top sellers; General_Acute is the routine catalog. */
const TOP_SELLER_PROFILES = new Set([
  'Chronic_Refill (Year-Round)',
  'Monsoon_Vector (Jul-Oct)',
  'Smog_Surge (Oct-Feb)',
]);

/**
 * Well-known branded ("English") equivalents by molecule INN, used when the
 * dataset carries no second source. Prices for these are estimates at the
 * Jan Aushadhi benchmark (~3x generic MRP) and are flagged altEstimated.
 */
const FAMOUS_BRANDS: Record<string, string> = {
  paracetamol: 'Dolo 650',
  ibuprofen: 'Brufen',
  'ibuprofen paracetamol': 'Ibugesic Plus',
  aspirin: 'Disprin',
  cetirizine: 'Cetzine',
  levocetirizine: 'Levocet',
  azithromycin: 'Azithral',
  amoxicillin: 'Mox 500',
  'amoxycillin clavulanic acid': 'Augmentin',
  'amoxicillin clavulanic acid': 'Augmentin',
  pantoprazole: 'Pantocid',
  omeprazole: 'Omez',
  esomeprazole: 'Nexum',
  rabeprazole: 'Razo',
  ranitidine: 'Aciloc',
  metformin: 'Glycomet',
  glimepiride: 'Amaryl',
  sitagliptin: 'Januvia',
  vildagliptin: 'Galvus',
  amlodipine: 'Amlopres',
  telmisartan: 'Telma',
  losartan: 'Losar',
  atenolol: 'Tenormin',
  metoprolol: 'Metolar',
  rosuvastatin: 'Rosuvas',
  atorvastatin: 'Atorva',
  levothyroxine: 'Thyronorm',
  salbutamol: 'Asthalin',
  montelukast: 'Montair',
  chlorpheniramine: 'Avil',
  diclofenac: 'Voveran',
  tramadol: 'Ultracet',
  domperidone: 'Domstal',
  ondansetron: 'Emeset',
  clopidogrel: 'Clopilet',
  ors: 'Electral',
  'oral rehydration salt': 'Electral',
  mefenamic: 'Meftal',
  dicyclomine: 'Cyclopam',
  'vitamin c': 'Limcee',
  folicacid: 'Folvite',
  'folic acid': 'Folvite',
};

/** Estimated branded-equivalent markup vs Jan Aushadhi generic MRP. */
const BRAND_ESTIMATE_FACTOR = 3;

interface ParsedIngredient {
  inn: string;
  strengthValue: string;
  strengthUnit: string;
}

interface ParsedMedicine {
  dosageForm: string;
  route: string;
  releaseType: string;
  strength: string;
  ingredients: ParsedIngredient[];
}

/** Narrow-therapeutic-index INNs flagged for the domain NTI guard. */
const NTI_INNS = new Set([
  'warfarin', 'digoxin', 'lithium', 'phenytoin', 'theophylline',
  'cyclosporine', 'cyclosporin', 'tacrolimus', 'carbamazepine',
  'levothyroxine', 'sirolimus', 'everolimus',
]);

/** Ordered form detection — injection/syrup patterns must win over 'powder for...' rows. */
const FORM_RULES: Array<[RegExp, string]> = [
  [/injection|infusion|vial|ampoule|\biv\b|\bim\b/, 'injection'],
  [/syrup|suspension|elixir|emulsion|drysyrup|dry syrup/, 'syrup'],
  [/suppository|pessary|enema/, 'suppository'],
  [/drops?\b/, 'drops'],
  [/tablet|tabs\b|lozenge|pill\b/, 'tablet'],
  [/capsule|softgel/, 'capsule'],
  [/cream|ointment|gel\b/, 'cream'],
  [/lotion/, 'lotion'],
  [/inhaler|respules|rotacap|rotahaler|transcaps|aerosol/, 'inhaler'],
  [/spray/, 'spray'],
  [/sachet|sachets|granules/, 'sachet'],
  [/powder/, 'powder'],
  [/solution|mouthwash|gargle|lavage/, 'solution'],
  [/soap|shampoo|swab|wipe|pad\b/, 'other'],
];

function detectForm(desc: string): string {
  const d = desc.toLowerCase().replace(/([a-z])(tablet|capsule|syrup|injection|infusion|drops|cream|ointment|gel)/, '$1 $2');
  for (const [re, form] of FORM_RULES) {
    if (re.test(d)) return form;
  }
  return 'other';
}

function detectRoute(form: string, desc: string): string {
  const d = desc.toLowerCase();
  if (form === 'injection') return 'PARENTERAL';
  if (form === 'drops') {
    if (/eye|ophthalmic/.test(d)) return 'OPHTHALMIC';
    if (/ear|otic/.test(d)) return 'OTIC';
    if (/nasal/.test(d)) return 'NASAL';
    return 'ORAL';
  }
  if (form === 'cream' || form === 'lotion') return 'TOPICAL';
  if (form === 'inhaler' || form === 'spray') return /nasal/.test(d) ? 'NASAL' : 'INHALATION';
  if (form === 'suppository') return 'RECTAL';
  return 'ORAL';
}

function detectReleaseType(desc: string): string {
  const d = desc.toLowerCase().replace(/\s+/g, ' ');
  if (/sustained|\bsr\b|extended|\ber\b/.test(d)) return 'SR';
  if (/controlled|\bcr\b/.test(d)) return 'CR';
  if (/delayed|\bdr\b|enteric/.test(d)) return 'DR';
  return 'IR';
}

const STRENGTH_RE = /(\d+(?:\.\d+)?)\s*(mg|mcg|g|gm|ml|%|iu|units?)\b(?:\s*\/\s*([a-z]+))?/i;

function parseStrength(text: string): { value: string; unit: string; display: string } | null {
  const m = text.match(STRENGTH_RE);
  if (!m) return null;
  let unit = m[2].toLowerCase();
  if (unit === 'gm') unit = 'g';
  if (unit === 'units') unit = 'unit';
  const denom = m[3] ? `/${m[3]}` : '';
  return { value: m[1], unit, display: `${m[1]} ${unit === '%' ? '% w/v' : unit}${denom}` };
}

function normalizeInn(raw: string): string {
  const t = raw.trim().replace(/\s+/g, ' ');
  if (!t) return '';
  return t[0].toUpperCase() + t.slice(1).toLowerCase();
}

/** Pull the active-ingredient name out of a composition fragment like "Amlodipine 5mg" / "Amoxicillin 125mg + Clavulanic Acid". */
function innFromCompositionPart(part: string): string {
  let inn = part
    .replace(STRENGTH_RE, ' ')
    .replace(/\b(ip|usp|bp)\b/gi, ' ')
    .replace(/[^\p{L}\s.-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // drop trailing qualifier words that are not part of the INN
  inn = inn.replace(/\b(standard|prophylaxis|concentrate|diluent|for)\b.*$/i, '').trim();
  return normalizeInn(inn);
}

/** Derive the INN from the medicine description when no composition column is available. */
function innFromDescription(desc: string, form: string): string {
  let d = desc
    .replace(/([a-z])(tablet|capsule|syrup|injection|infusion|drops|cream|ointment|gel|lotion|spray|solution|powder)/gi, '$1 $2')
    // strip dosage strings first so "IP10% w/v" cannot leak into the INN
    .replace(/\b\d+(?:\.\d+)?\s*%(?:\s*w\/[vV])?/g, ' ')
    .replace(STRENGTH_RE, ' ')
    .replace(/\b(?:ip|usp|bp|inp)(?=\d)/gi, ' ');
  const formWord = FORM_RULES.find(([re]) => re.test(d.toLowerCase()));
  let inn = d;
  if (formWord) {
    const m = d.match(new RegExp(formWord[0].source, 'i'));
    if (m && m.index !== undefined) inn = d.slice(0, m.index);
  }
  inn = inn
    .replace(/\b(ip|usp|bp|inp)\b/gi, ' ')
    .replace(/\b\d+(\.\d+)?\s*%(\s*w\/[vV])?/g, ' ')
    .replace(/[^\p{L}\s.-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return normalizeInn(inn);
}

function parseIngredients(row: SourceRow, form: string): ParsedIngredient[] {
  const compRaw = (row.zeelab_composition ?? row.tata1mg_composition ?? '') as string;
  const desc = (row.Medicine_Description ?? '') as string;
  const out: ParsedIngredient[] = [];

  if (compRaw.trim()) {
    for (const part of compRaw.split(/\s*\+\s*/)) {
      const inn = innFromCompositionPart(part);
      const st = parseStrength(part);
      if (inn) {
        out.push({ inn, strengthValue: st?.value ?? '0', strengthUnit: st?.unit ?? 'mg' });
      }
    }
  }

  if (out.length === 0) {
    const inn = innFromDescription(desc, form) || 'Unspecified';
    const st = parseStrength(desc);
    out.push({ inn, strengthValue: st?.value ?? '0', strengthUnit: st?.unit ?? 'mg' });
  }

  return out.slice(0, 4);
}

function parseStrengthDisplay(row: SourceRow): string {
  const desc = (row.Medicine_Description ?? '') as string;
  const compRaw = ((row.zeelab_composition ?? row.tata1mg_composition ?? '') as string).split(/\s*\+\s*/)[0] ?? '';
  return parseStrength(desc)?.display ?? parseStrength(compRaw)?.display ?? 'unspecified';
}

function fingerprintFor(form: string, route: string, releaseType: string, ingredients: ParsedIngredient[]): string {
  const canonical = {
    schemaVersion: 1,
    dosageForm: form,
    route,
    releaseType,
    ingredients: [...ingredients]
      .sort((a, b) => a.inn.localeCompare(b.inn))
      .map((i) => ({
        ingredientInn: i.inn,
        strengthValue: i.strengthValue,
        strengthUnit: i.strengthUnit,
        concentrationDenominator: null as string | null,
      })),
  };
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

function manufacturerFor(source: string | null | undefined): { name: string } {
  const s = (source ?? '').trim();
  if (!s) return { name: 'Generic Supplier' };
  return { name: s };
}

interface PricePair {
  mrp: number | null;
  unitPrice: number | null;
}

interface SourcePrices {
  source: 'pmbi' | 'zeelab' | 'tata1mg';
  productName: string | null;
  mrp: number | null;
  unitPrice: number | null;
}

function sourcePrices(row: SourceRow, source: 'pmbi' | 'zeelab' | 'tata1mg'): SourcePrices {
  const productName =
    source === 'pmbi'
      ? (row.pmbi_product_name ?? null)
      : source === 'zeelab'
        ? (row.zeelab_brand_name ?? null)
        : (row.tata1mg_brand_name ?? null);
  return {
    source,
    productName,
    mrp: (row[`${source}_mrp`] as number | null | undefined) ?? null,
    unitPrice: (row[`${source}_unit_price`] as number | null | undefined) ?? null,
  };
}

function pickPrimaryPrice(row: SourceRow): PricePair {
  const cheapest = (row.Cheapest_Source ?? '').trim();
  const order: Array<'pmbi' | 'zeelab' | 'tata1mg'> = [];
  if (/zeelab/i.test(cheapest)) order.push('zeelab');
  else if (/tata/i.test(cheapest)) order.push('tata1mg');
  else if (/pmbi|jan aushadhi/i.test(cheapest) || !cheapest) order.push('pmbi');
  for (const s of order) {
    const p = sourcePrices(row, s);
    if (p.mrp !== null || p.unitPrice !== null) return { mrp: p.mrp, unitPrice: p.unitPrice };
  }
  for (const s of ['pmbi', 'zeelab', 'tata1mg'] as const) {
    const p = sourcePrices(row, s);
    if (p.mrp !== null || p.unitPrice !== null) return { mrp: p.mrp, unitPrice: p.unitPrice };
  }
  return { mrp: null, unitPrice: null };
}

/** The branded "English" alternative: a real second source when present, else a curated brand name with an estimated MRP. */
function pickAlternative(
  row: SourceRow,
  primaryMrp: number | null,
  ingredients: ParsedIngredient[],
): { altBrandName: string | null; altMrp: number | null; altEstimated: boolean } {
  const primarySource = (row.Cheapest_Source ?? '').trim();
  const isPrimary = (s: 'pmbi' | 'zeelab' | 'tata1mg') =>
    s === 'pmbi' ? /pmbi|jan aushadhi|^$/i.test(primarySource) : new RegExp(s, 'i').test(primarySource);

  const candidates = (['zeelab', 'tata1mg', 'pmbi'] as const)
    .filter((s) => !isPrimary(s))
    .map((s) => sourcePrices(row, s))
    .filter((p) => p.productName && p.mrp !== null)
    .sort((a, b) => (b.unitPrice ?? b.mrp ?? 0) - (a.unitPrice ?? a.mrp ?? 0));

  if (candidates.length > 0) {
    const alt = candidates[0];
    return { altBrandName: alt.productName, altMrp: alt.mrp, altEstimated: false };
  }

  const innKey = (ingredients[0]?.inn ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
  const famous = FAMOUS_BRANDS[innKey] ?? FAMOUS_BRANDS[innKey.replace(/\s+/g, '')];
  if (primaryMrp !== null && primaryMrp > 0) {
    const est = Math.round(primaryMrp * BRAND_ESTIMATE_FACTOR * 100) / 100;
    return { altBrandName: famous ?? null, altMrp: est, altEstimated: true };
  }
  return { altBrandName: famous ?? null, altMrp: null, altEstimated: true };
}

function scheduleFor(raw: string | null | undefined): { code: string; label: string } {
  const s = (raw ?? '').trim();
  if (/cytotoxic/i.test(s)) return { code: 'H-CYTO', label: 'Schedule H — Cytotoxic (hospital handling)' };
  if (/h1/i.test(s)) return { code: 'H1', label: 'Schedule H1 (prescription, register entry)' };
  if (/ndps|schedule x/i.test(s)) return { code: 'X', label: 'Schedule X / NDPS (special prescription)' };
  if (/medical device/i.test(s)) return { code: 'DEVICE', label: 'Medical Device (not a drug)' };
  if (/otc/i.test(s)) return { code: 'OTC', label: 'Over-the-counter' };
  if (/schedule h/i.test(s) || /^h$/i.test(s)) return { code: 'H', label: 'Schedule H (prescription required)' };
  if (!s) return { code: 'OTC', label: 'Over-the-counter (unclassified default)' };
  return { code: s.toUpperCase().replace(/\s+/g, '-').slice(0, 24), label: s };
}

async function seedDemoFacility(): Promise<void> {
  await prisma.customer.upsert({
    where: { id: DEMO_CUSTOMER_ID },
    update: {},
    create: {
      id: DEMO_CUSTOMER_ID,
      email: 'demo@genericquick.test',
      phone: '+91-9000000001',
      fullName: 'Demo Customer',
    },
  });
  await prisma.address.upsert({
    where: { id: DEMO_ADDRESS_ID },
    update: {},
    create: {
      id: DEMO_ADDRESS_ID,
      customerId: DEMO_CUSTOMER_ID,
      street: 'Plot 5, Saket District Centre',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110017',
      geo: '28.5245,77.2066',
      isDefault: true,
    },
  });
  await prisma.darkStore.upsert({
    where: { id: DEMO_DARK_STORE_ID },
    update: {},
    create: {
      id: DEMO_DARK_STORE_ID,
      name: 'Saket Demo Dark Store',
      licenseNumber: 'DS-LIC-0001',
      addressId: DEMO_ADDRESS_ID,
      deliveryPolygon: JSON.stringify({ type: 'Point', coordinates: [77.2066, 28.5245] }),
      isActive: true,
    },
  });
  await prisma.darkStoreLicense.upsert({
    where: { id: DEMO_LICENSE_ID },
    update: {},
    create: {
      id: DEMO_LICENSE_ID,
      darkStoreId: DEMO_DARK_STORE_ID,
      licenseType: 'RETAIL_PHARMACY',
      licenseNumber: 'DS-LIC-0001',
      issuedAt: new Date(Date.now() - 365 * 24 * 3600 * 1000),
      expiresAt: new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000),
    },
  });
}

async function main(): Promise<void> {
  const raw = readFileSync(DATA_FILE, 'utf-8');
  const rows: SourceRow[] = raw
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as SourceRow);

  const eligible = rows.filter((r) => r.Retail_Status === 'ACTIVE_DISPATCHABLE');
  const skipped = rows.length - eligible.length;
  console.log(`source rows: ${rows.length}, eligible (ACTIVE_DISPATCHABLE): ${eligible.length}, skipped: ${skipped}`);

  // The NDJSON file is the source of truth for the catalog — wipe previous
  // ingest (in FK-safe order) so a re-run replaces it cleanly.
  await prisma.stockReservation.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.formulationIngredient.deleteMany();
  await prisma.brandMedicine.deleteMany();
  await prisma.cytotoxicDrug.deleteMany();
  await prisma.inventoryBatch.deleteMany();
  await prisma.formulation.deleteMany();
  await prisma.molecule.deleteMany();
  await prisma.manufacturer.deleteMany();
  await prisma.regulatorySchedule.deleteMany();

  await seedDemoFacility();

  const expiry = new Date(Date.now() + 550 * 24 * 3600 * 1000);
  const usedBrandNames = new Map<string, number>();
  let moleculeCount = 0;

  for (let i = 0; i < eligible.length; i++) {
    const row = eligible[i];
    const desc = ((row.Medicine_Description ?? row.canonical_key ?? 'unknown medicine') as string).trim();
    const form = detectForm(desc);
    const route = detectRoute(form, desc);
    const releaseType = detectReleaseType(desc);
    const strength = parseStrengthDisplay(row);
    const ingredients = parseIngredients(row, form);
    const schedule = scheduleFor(row.Prescription_Schedule);
    const manufacturer = manufacturerFor(row.Cheapest_Source);
    const fingerprint = fingerprintFor(form, route, releaseType, ingredients);
    const primaryPrice = pickPrimaryPrice(row);
    const alternative = pickAlternative(row, primaryPrice.mrp, ingredients);
    const surgeProfile = (row.Delhi_Surge_Profile ?? '') as string;
    const isTopSeller = TOP_SELLER_PROFILES.has(surgeProfile);

    const moleculeInn = normalizeInn(ingredients[0].inn) || 'Unspecified';
    const molecule = await prisma.molecule.upsert({
      where: { inn: moleculeInn },
      update: { isNarrowTherapeuticIndex: NTI_INNS.has(moleculeInn.toLowerCase()) },
      create: { inn: moleculeInn, isNarrowTherapeuticIndex: NTI_INNS.has(moleculeInn.toLowerCase()) },
    });
    moleculeCount += 1;

    const mfr = await prisma.manufacturer.upsert({
      where: { name: manufacturer.name },
      update: {},
      create: { name: manufacturer.name, licenseNo: `LIC-${manufacturer.name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 40)}` },
    });

    const reg = await prisma.regulatorySchedule.upsert({
      where: { code: schedule.code },
      update: { label: schedule.label },
      create: schedule,
    });

    const formulation = await prisma.formulation.upsert({
      where: { fingerprint },
      update: {},
      create: {
        fingerprint,
        releaseType,
        dosageForm: form,
        strength,
        route,
        moleculeId: molecule.id,
        isTopSeller,
        mrp: primaryPrice.mrp,
        unitPrice: primaryPrice.unitPrice,
        altBrandName: alternative.altBrandName,
        altMrp: alternative.altMrp,
        altEstimated: alternative.altEstimated,
      },
    });

    for (const ing of ingredients) {
      const ingMolecule = await prisma.molecule.upsert({
        where: { inn: ing.inn },
        update: { isNarrowTherapeuticIndex: NTI_INNS.has(ing.inn.toLowerCase()) },
        create: { inn: ing.inn, isNarrowTherapeuticIndex: NTI_INNS.has(ing.inn.toLowerCase()) },
      });
      const quantityMg = Number(ing.strengthValue) || 0;
      const existing = await prisma.formulationIngredient.findFirst({
        where: { formulationId: formulation.id, moleculeId: ingMolecule.id },
      });
      if (!existing) {
        await prisma.formulationIngredient.create({
          data: {
            formulationId: formulation.id,
            moleculeId: ingMolecule.id,
            quantityMg,
            isActive: true,
          },
        });
      }
    }

    const baseBrand =
      ((row.pmbi_product_name ?? row.zeelab_brand_name ?? row.tata1mg_brand_name ?? '') as string).trim() || desc;
    const dup = usedBrandNames.get(baseBrand) ?? 0;
    usedBrandNames.set(baseBrand, dup + 1);
    const brandName = dup === 0 ? baseBrand : `${baseBrand} (${strength} #${dup + 1})`;

    await prisma.brandMedicine.upsert({
      where: { brandName },
      update: { formulationId: formulation.id, manufacturerId: mfr.id, regulatoryScheduleId: reg.id },
      create: {
        brandName,
        formulationId: formulation.id,
        manufacturerId: mfr.id,
        regulatoryScheduleId: reg.id,
      },
    });

    await prisma.inventoryBatch.createMany({
      data: [
        {
          formulationId: formulation.id,
          darkStoreId: DEMO_DARK_STORE_ID,
          availableQty: 400,
          reservedQty: 0,
          batchNumber: `SEED-${String(i + 1).padStart(5, '0')}`,
          expiryDate: expiry,
        },
      ],
      skipDuplicates: true,
    });

    if ((i + 1) % 250 === 0) console.log(`  ingested ${i + 1}/${eligible.length}`);
  }

  const totals = {
    molecules: await prisma.molecule.count(),
    formulations: await prisma.formulation.count(),
    brands: await prisma.brandMedicine.count(),
    batches: await prisma.inventoryBatch.count(),
    manufacturers: await prisma.manufacturer.count(),
    schedules: await prisma.regulatorySchedule.count(),
  };
  console.log(`unique molecules seen this run: ${moleculeCount}`);
  console.log('totals:', JSON.stringify(totals));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
