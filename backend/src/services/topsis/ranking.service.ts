export const rankByPreference = <T extends { preference: number }>(items: T[]) => [...items].sort((a, b) => b.preference - a.preference).map((item, index) => ({ ...item, ranking: index + 1 }));
