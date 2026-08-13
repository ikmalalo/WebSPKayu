export function requireFields(body: Record<string, unknown>, fields: string[]) {
  return fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === '');
}

export const isEmail = (value: unknown) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
