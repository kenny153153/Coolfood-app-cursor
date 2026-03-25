import type { Product, WholesalePricingRules, CostItem } from './types';
import type { Ingredient } from './types';
import { computeProductCost, computePackCost } from './supabaseMappers';

export type PricingTier = 'guest' | 'member';

export const roundPrice = (v: number) => Math.round(v * 100) / 100;

export const getEffectiveUnitPrice = (
  p: Product, qty: number,
  tier: PricingTier = 'guest',
) => {
  const base = (tier === 'member' && p.memberPrice > 0 && p.memberPrice < p.price)
    ? p.memberPrice
    : p.price;

  if (p.bulkDiscount && qty >= p.bulkDiscount.threshold) {
    if (p.bulkDiscount.type === 'percent') {
      return roundPrice(base * (1 - p.bulkDiscount.value / 100));
    } else {
      return p.bulkDiscount.value;
    }
  }

  return roundPrice(base);
};

export const getWholesaleUnitPrice = (
  p: Product,
  linkedIngredient: Ingredient | undefined,
  costItems: CostItem[],
  wholesaleRules: WholesalePricingRules,
  memberPriceTier?: string,
  priceOverrides?: Record<string, number>,
): number => {
  const perLbCost = computeProductCost(p, linkedIngredient, costItems);
  const packCost = computePackCost(perLbCost, p.packWeightLb, p.pricingMode);
  const override = priceOverrides?.[p.id];
  const p0 = override != null ? override : (packCost > 0 ? packCost / wholesaleRules.targetMarginFactor : p.price);
  if (!memberPriceTier || memberPriceTier === 'P0') return roundPrice(p0);
  const tier = wholesaleRules.priceTiers?.find(t => t.name === memberPriceTier);
  if (tier) return roundPrice(p0 / tier.factor);
  return roundPrice(p0);
};
