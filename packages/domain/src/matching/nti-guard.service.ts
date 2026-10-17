import { NtiHardBlockError } from '../errors';

// R4-1: NTI (narrow therapeutic index) molecules are hard-blocked.
// The NTI list is maintained by the Clinical Pharmacologist and must be
// reviewed before any dispensing involving these molecules.
//
// NTI molecules per assumption A4: warfarin, phenytoin, lithium,
// carbamazepine, digoxin.
const NTI_INNS = new Set([
  'warfarin',
  'phenytoin',
  'lithium',
  'carbamazepine',
  'digoxin',
]);

export interface NtiCheckResult {
  blocked: boolean;
  blockedMolecules: string[];
}

export function checkNtiHardBlock(
  moleculeInns: string[],
  formulationId: string,
): NtiCheckResult {
  const blockedMolecules = moleculeInns.filter(inn => NTI_INNS.has(inn.toLowerCase()));
  if (blockedMolecules.length > 0) {
    const blockedInn = blockedMolecules[0];
    if (blockedInn === undefined) throw new Error('Unexpected empty blocked molecule');
    throw new NtiHardBlockError(blockedInn, formulationId);
  }
  return { blocked: false, blockedMolecules: [] };
}

export function isNtiMolecule(inn: string): boolean {
  return NTI_INNS.has(inn.toLowerCase());
}
