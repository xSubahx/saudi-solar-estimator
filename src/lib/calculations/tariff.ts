import type { TariffResult } from '@/types';
import { ASSUMPTIONS } from '@/lib/data/assumptions';

const { tier1MaxKwhPerMonth, tier1RateSarPerKwh, tier2RateSarPerKwh } = ASSUMPTIONS.tariff;

/**
 * Calculates the monthly and annual SEC residential electricity bill.
 *
 * CRITICAL: The tariff is tiered on MONTHLY consumption, NOT annual.
 * SEC bills per meter-read cycle (~monthly). Do NOT sum annual kWh and apply
 * tiers once — that underestimates the bill for high-consumption months.
 *
 * QUALITY GATES:
 *   calculateTariff(3000) → monthlyBill = 540  SAR  (3000 × 0.18)
 *   calculateTariff(6000) → monthlyBill = 1080 SAR  (6000 × 0.18)
 *   calculateTariff(7000) → monthlyBill = 1380 SAR  (6000×0.18 + 1000×0.30)
 */
export function calculateTariff(monthlyKwh: number): TariffResult {
  const safeKwh = Math.max(0, monthlyKwh);
  const tier1Kwh = Math.min(safeKwh, tier1MaxKwhPerMonth);
  const tier2Kwh = Math.max(0, safeKwh - tier1MaxKwhPerMonth);

  const monthlyBill =
    tier1Kwh * tier1RateSarPerKwh + tier2Kwh * tier2RateSarPerKwh;

  const annualBill = monthlyBill * 12;

  // Blended (effective) rate weighted by consumed kWh
  const blendedRate = safeKwh > 0 ? monthlyBill / safeKwh : tier1RateSarPerKwh;

  return {
    monthlyBill: Math.round(monthlyBill * 100) / 100,
    annualBill: Math.round(annualBill * 100) / 100,
    blendedRate: Math.round(blendedRate * 10000) / 10000,
    tier1Kwh,
    tier2Kwh,
  };
}

/**
 * Calculates the reduced monthly bill after solar self-consumption offsets
 * some grid imports.
 *
 * The `selfConsumedKwh` is subtracted from `baseMonthlyKwh` before applying
 * tiered rates — this correctly captures the benefit of displacing the
 * highest-priced kWh first (since solar production peaks midday while heavy
 * AC load may extend into tier 2).
 */
export function calculateReducedTariff(
  baseMonthlyKwh: number,
  selfConsumedKwh: number
): TariffResult {
  const reducedKwh = Math.max(0, baseMonthlyKwh - selfConsumedKwh);
  return calculateTariff(reducedKwh);
}

/**
 * Estimates monthly kWh consumption from a monthly SAR bill amount.
 * Uses the tiered SEC structure to back-calculate.
 *
 * Returns null if the amount is zero or negative.
 * NOTE: This is an estimate — the UI must clearly label it as such.
 * Minor discrepancies can arise from billing adjustments, VAT, or fixed charges.
 */
export function estimateKwhFromBill(monthlySar: number): number | null {
  if (monthlySar <= 0) return null;

  // Cost of the full tier 1 block
  const tier1MaxCost = tier1MaxKwhPerMonth * tier1RateSarPerKwh;

  if (monthlySar <= tier1MaxCost) {
    // Entire bill falls within tier 1
    return monthlySar / tier1RateSarPerKwh;
  } else {
    // Bill spans both tiers
    const tier2Cost = monthlySar - tier1MaxCost;
    const tier2Kwh = tier2Cost / tier2RateSarPerKwh;
    return tier1MaxKwhPerMonth + tier2Kwh;
  }
}
