export interface CytotoxicHandling {
  ppeRequired: boolean;
  segregatedStorage: boolean;
  pregnantWomanHandling: boolean;
}

export interface CytotoxicDrug {
  id: string;
  formulationId: string;
  cytotoxicHandling: CytotoxicHandling;
  specialStorageRequired: boolean;
  handlingRestrictions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCytotoxicDrugInput {
  formulationId: string;
  cytotoxicHandling: CytotoxicHandling;
  specialStorageRequired: boolean;
  handlingRestrictions: string[];
}

export enum CytotoxicHandlingLevel {
  STANDARD = 'STANDARD',
  ELEVATED = 'ELEVATED',
  MAXIMUM = 'MAXIMUM',
}
