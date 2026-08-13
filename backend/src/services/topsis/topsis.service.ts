import { idealSolutions } from './ideal-solution.service';
import { normalizeMatrix } from './normalization.service';
import { rankByPreference } from './ranking.service';
import { euclideanDistance } from './distance.service';
import { weightMatrix } from './weighting.service';

export interface TopsisAlternative { pengajuanId: string; values: number[] }
export interface TopsisRun { pengajuanId: string; ranking: number; preference: number; dPlus: number; dMinus: number; values: number[]; normalized: number[]; weighted: number[] }

export function calculateTopsis(alternatives: TopsisAlternative[], weights: number[], types: ('BENEFIT' | 'COST')[]): TopsisRun[] {
  const matrix = alternatives.map((item) => item.values);
  const { normalized } = normalizeMatrix(matrix);
  const weighted = weightMatrix(normalized, weights);
  const { positive, negative } = idealSolutions(weighted, types);
  const unranked = alternatives.map((alternative, i) => {
    const dPlus = euclideanDistance(weighted[i], positive);
    const dMinus = euclideanDistance(weighted[i], negative);
    return { pengajuanId: alternative.pengajuanId, values: alternative.values, normalized: normalized[i], weighted: weighted[i], dPlus, dMinus, preference: dPlus + dMinus === 0 ? 0 : dMinus / (dPlus + dMinus) };
  });
  return rankByPreference(unranked);
}
