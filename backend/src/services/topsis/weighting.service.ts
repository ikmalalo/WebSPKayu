export const weightMatrix = (normalized: number[][], weights: number[]) => normalized.map((row) => row.map((value, j) => value * weights[j]));
