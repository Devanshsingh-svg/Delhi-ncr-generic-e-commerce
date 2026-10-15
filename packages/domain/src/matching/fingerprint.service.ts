import { createHash } from 'crypto';

import { CanonicalFormulation } from '@gq/contracts';

import { FormulationFingerprintCollisionError } from '../errors';
import { FormulationPersistencePort, FormulationCreateInput } from '../ports/formulation-persistence.port';

const SCHEMA_VERSION = 1;

export function computeFingerprint(
  ingredients: CanonicalFormulation['ingredients'],
  dosageForm: string,
  route: string,
  releaseType: string | null,
): { canonicalJson: string; fingerprint: Buffer } {
  // R7-14: Sort inside compute() by INN
  const sortedIngredients = [...ingredients].sort((a, b) => a.ingredientInn.localeCompare(b.ingredientInn));
  const canonical: CanonicalFormulation = {
    schemaVersion: SCHEMA_VERSION,
    dosageForm,
    route,
    releaseType,
    ingredients: sortedIngredients.map(i => ({
      ingredientInn: i.ingredientInn,
      strengthValue: i.strengthValue,
      strengthUnit: i.strengthUnit,
      concentrationDenominator: i.concentrationDenominator,
    })),
  };
  const canonicalJson = JSON.stringify(canonical);
  const fingerprint = createHash('sha256').update(canonicalJson).digest();
  return { canonicalJson, fingerprint };
}

export async function createFormulationWithIngredients(
  port: FormulationPersistencePort,
  data: FormulationCreateInput,
): Promise<{ id: string; fingerprint: Buffer; canonicalJson: string }> {
  const molecules = await port.findMoleculesByIds(data.ingredients.map(i => i.ingredientId));
  const innById = new Map(molecules.map(m => [m.id, m.innNormalized]));
  const canonicalIngredients = data.ingredients.map((ing) => ({
    ingredientInn: innById.get(ing.ingredientId) ?? '',
    strengthValue: ing.strengthValue.toString(),
    strengthUnit: ing.strengthUnit,
    concentrationDenominator: ing.concentrationDenominator,
  }));
  const { fingerprint } = computeFingerprint(
    canonicalIngredients as CanonicalFormulation['ingredients'],
    data.dosageForm,
    data.route,
    data.releaseType,
  );
  const existing = await port.findFormulationByFingerprint(fingerprint);
  if (existing) throw new FormulationFingerprintCollisionError(`Formulation with identical fingerprint exists: ${existing.id}`, existing.id);
  return port.createFormulationWithIngredients({
    ...data,
    ingredients: canonicalIngredients.map((ci, idx) => ({
      ingredientId: data.ingredients[idx]?.ingredientId ?? '',
      strengthValue: data.ingredients[idx]?.strengthValue ?? 0,
      strengthUnit: data.ingredients[idx]?.strengthUnit ?? '',
      concentrationDenominator: data.ingredients[idx]?.concentrationDenominator ?? null,
    })),
  });
}