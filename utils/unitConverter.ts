export type WeightUnit = 'g' | 'kg' | 'lb' | 'catty';

const GRAMS_PER_UNIT: Record<WeightUnit, number> = {
  g: 1,
  kg: 1000,
  lb: 453.592,
  catty: 600,
};

export const normalizeWeightUnit = (unit?: string | null): WeightUnit => {
  if (!unit) return 'g';
  const raw = unit.toLowerCase();
  if (raw === 'kg') return 'kg';
  if (raw === 'lb') return 'lb';
  if (raw === 'catty' || raw === '斤') return 'catty';
  return 'g';
};

export const convertWeight = (value: number, fromUnit: WeightUnit, toUnit: WeightUnit): number => {
  if (!Number.isFinite(value)) return 0;
  const grams = value * GRAMS_PER_UNIT[fromUnit];
  return grams / GRAMS_PER_UNIT[toUnit];
};

export const convertCost = (amount: number, fromUnit: WeightUnit, toUnit: WeightUnit): number => {
  if (!Number.isFinite(amount)) return 0;
  return amount * (GRAMS_PER_UNIT[toUnit] / GRAMS_PER_UNIT[fromUnit]);
};

