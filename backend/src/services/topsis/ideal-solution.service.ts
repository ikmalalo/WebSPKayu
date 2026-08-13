export const idealSolutions = (weighted: number[][], types: ('BENEFIT' | 'COST')[]) => ({
  positive: types.map((type, j) => type === 'BENEFIT' ? Math.max(...weighted.map((r) => r[j])) : Math.min(...weighted.map((r) => r[j]))),
  negative: types.map((type, j) => type === 'BENEFIT' ? Math.min(...weighted.map((r) => r[j])) : Math.max(...weighted.map((r) => r[j]))),
});
