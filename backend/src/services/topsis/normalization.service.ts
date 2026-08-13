export const normalizeMatrix = (matrix: number[][]) => {
  const denominators = matrix[0].map((_, j) => Math.sqrt(matrix.reduce((sum, row) => sum + row[j] ** 2, 0)) || 1);
  return { denominators, normalized: matrix.map((row) => row.map((value, j) => value / denominators[j])) };
};
