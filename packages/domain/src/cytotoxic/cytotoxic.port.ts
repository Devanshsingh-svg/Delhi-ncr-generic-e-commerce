import { CytotoxicDrug, CytotoxicHandling, CreateCytotoxicDrugInput } from './cytotoxic.entity';

export abstract class CytotoxicPersistencePort {
  abstract create(input: CreateCytotoxicDrugInput): Promise<CytotoxicDrug>;
  abstract findById(id: string): Promise<CytotoxicDrug | null>;
  abstract findByFormulationId(formulationId: string): Promise<CytotoxicDrug | null>;
  abstract updateHandling(id: string, handling: CytotoxicHandling): Promise<void>;
  abstract updateStorage(id: string, specialStorageRequired: boolean): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
