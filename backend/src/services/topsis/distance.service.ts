export const euclideanDistance = (row: number[], ideal: number[]) => Math.sqrt(row.reduce((sum, value, j) => sum + (value - ideal[j]) ** 2, 0));
