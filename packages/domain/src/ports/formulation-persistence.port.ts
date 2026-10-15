export interface FormulationIngredientInput {
  ingredientId: string;
  strengthValue: { toString(): string };
  strengthUnit: string;
  concentrationDenominator: string | null;
}

export interface FormulationCreateInput {
  dosageForm: string;
  route: string;
  releaseType: string | null;
  ingredients: FormulationIngredientInput[];
}

export interface FormulationRecord {
  id: string;
  dosageForm: string;
  route: string;
  releaseType: string | null;
  fingerprint: Buffer;
  canonicalJson: string;
  schemaVersion: number;
  createdAt: Date;
}

export abstract class FormulationPersistencePort {
  abstract findMoleculesByIds(ids: string[]): Promise<{ id: string; innNormalized: string }[]>;
  abstract findFormulationByFingerprint(fp: Buffer): Promise<FormulationRecord | null>;
  abstract createFormulationWithIngredients(data: FormulationCreateInput): Promise<FormulationRecord>;
}