import type {
  SavingsRange,
  MonthlySavingsRow,
  SavingsMode,
  ConsumptionConfig,
  ExportConfig,
  PVGISResponse,
} from '@/types';
import { ASSUMPTIONS } from '@/lib/data/assumptions';
import { calculateTariff, calculateReducedTariff } from './tariff';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Saudi Arabia seasonal consumption weight per month.
 * Index 0=January … 11=December.
 *
 * Saudi summer (June–September) carries heavy residential AC load — roughly
 * 1.5–2× the winter load. The weights below are empirically derived from
 * typical Saudi SEC billing patterns.
 *
 * These weights are normalized so their sum = 12, meaning:
 *   monthlyConsumption[i] = monthlyAvgKwh × NORMALIZED_WEIGHTS[i]
 * and the 12-month sum = 12 × monthlyAvgKwh (as expected).
 */
export const SAUDI_SEASONAL_WEIGHTS_RAW = [
  0.65, // Jan
  0.65, // Feb
  0.75, // Mar
  0.80, // Apr
  1.00, // May
  1.40, // Jun
  1.80, // Jul — peak AC month
  1.80, // Aug — peak AC month
  1.40, // Sep
  1.00, // Oct
  0.80, // Nov
  0.65, // Dec
];

const RAW_SUM = SAUDI_SEASONAL_WEIGHTS_RAW.reduce((a, b) => a + b, 0); // = 12.70

// Normalize so the 12 months sum to 12 (i.e., annual = 12 × monthlyAvg)
export const SAUDI_SEASONAL_WEIGHTS = SAUDI_SEASONAL_WEIGHTS_RAW.map(
  (w) => (w / RAW_SUM) * 12
);

/**
 * Distributes a monthly average kWh across 12 months using the Saudi
 * seasonal consumption profile.
 */
export function getMonthlyConsumption(monthlyAvgKwh: number): number[] {
  return SAUDI_SEASONAL_WEIGHTS.map((w) => monthlyAvgKwh * w);
}

/**
 * Core savings engine — always returns a RANGE, never a single value.
 *
 * Self-consumption ratio determines what fraction of solar production is
 * consumed on-site (rather than exported). It depends on household occupancy,
 * load timing, and battery storage — all unknowns without 15-min meter data.
 * We use literature bounds from Fraunhofer ISE (20–40%) and show both ends.
 *
 * Mode behaviour:
 *   conservative (default): scLow=20%, scHigh=40%  (Fraunhofer residential, no battery)
 *   profile (v2 stub):      scLow=35%, scHigh=60%  (load-profile matching — not yet implemented)
 *   net-billing:            same SC range, plus export credit IF explicitly provided
 *
 * CRITICAL INVARIANT:
 *   Export credit is NEVER added if exportConfig.creditRatePerKwh === null.
 *   This must hold regardless of mode. Violating it produces inflated savings
 *   that could mislead investment decisions.
 *
 * Monthly calculation:
 *   selfConsumed = clamp(production × scRatio, 0, monthlyConsumption)
 *   savings = baseBill − reducedBill(consumption − selfConsumed)
 *   [+ exported × creditRate only if net-billing AND creditRate !== null]
 */
export function calculateSavingsRange(
  pvgisData: PVGISResponse,
  consumption: ConsumptionConfig,
  exportConfig: ExportConfig,
  mode: SavingsMode,
  selfConsumptionOverride?: number | null
): { savingsRange: SavingsRange; monthlyBreakdown: MonthlySavingsRow[] } {
  // Monthly production from PVGIS (E_m = average monthly energy production in kWh)
  const monthlyProduction = pvgisData.outputs.monthly.fixed.map((m) => m.E_m);

  // Monthly consumption with Saudi seasonal profile
  const monthlyConsumption = getMonthlyConsumption(consumption.monthlyKwh);

  // Determine self-consumption bounds by mode
  let scLow: number;
  let scHigh: number;

  // If user has set a specific self-consumption value via the slider,
  // use it as both low and high (single-point estimate instead of range)
  if (selfConsumptionOverride != null && selfConsumptionOverride > 0) {
    scLow = selfConsumptionOverride;
    scHigh = selfConsumptionOverride;
  } else {
    switch (mode) {
      case 'net-billing':
      case 'conservative':
      default:
        scLow = ASSUMPTIONS.selfConsumption.conservativeLow;   // 0.35
        scHigh = ASSUMPTIONS.selfConsumption.conservativeHigh; // 0.55
        break;
      case 'profile':
        // Stub: v2 will use hour-by-hour load-profile matching.
        // For now, return a slightly higher range as a placeholder.
        scLow = ASSUMPTIONS.selfConsumption.profileLow;   // 0.50
        scHigh = ASSUMPTIONS.selfConsumption.profileHigh; // 0.70
        break;
    }
  }

  const monthlyBreakdown: MonthlySavingsRow[] = [];
  let totalSavingsMin = 0;
  let totalSavingsMax = 0;
  let totalSelfConsumedMin = 0;
  let totalSelfConsumedMax = 0;

  for (let i = 0; i < 12; i++) {
    const prodKwh = monthlyProduction[i] ?? 0;
    const consumKwh = monthlyConsumption[i];

    // Self-consumption is bounded by both what the panels produce AND what the
    // household actually consumes (you can't self-consume more than either).
    const rawSelfConsumedMin = prodKwh * scLow;
    const rawSelfConsumedMax = prodKwh * scHigh;

    const selfConsumedMin = Math.min(rawSelfConsumedMin, consumKwh);
    const selfConsumedMax = Math.min(rawSelfConsumedMax, consumKwh);

    const exportedMin = Math.max(0, prodKwh - selfConsumedMax);
    const exportedMax = Math.max(0, prodKwh - selfConsumedMin);

    // Avoided grid cost: compare base bill vs. bill with solar offset
    const baseTariff = calculateTariff(consumKwh);
    const reducedMin = calculateReducedTariff(consumKwh, selfConsumedMin);
    const reducedMax = calculateReducedTariff(consumKwh, selfConsumedMax);

    let savingsMin = baseTariff.monthlyBill - reducedMin.monthlyBill;
    let savingsMax = baseTariff.monthlyBill - reducedMax.monthlyBill;

    // Export credit — only if net-billing mode AND user has explicitly set a rate
    // NEVER add export credit if creditRatePerKwh is null (even if mode is net-billing)
    if (
      mode === 'net-billing' &&
      exportConfig.enabled &&
      exportConfig.creditRatePerKwh !== null
    ) {
      savingsMin += exportedMin * exportConfig.creditRatePerKwh;
      savingsMax += exportedMax * exportConfig.creditRatePerKwh;
    }

    // Ensure savings are non-negative (can't save more than the bill)
    savingsMin = Math.max(0, savingsMin);
    savingsMax = Math.max(0, savingsMax);

    totalSavingsMin += savingsMin;
    totalSavingsMax += savingsMax;
    totalSelfConsumedMin += selfConsumedMin;
    totalSelfConsumedMax += selfConsumedMax;

    monthlyBreakdown.push({
      month: MONTH_NAMES[i],
      monthNum: i + 1,
      productionKwh: Math.round(prodKwh),
      consumptionKwh: Math.round(consumKwh),
      selfConsumedMinKwh: Math.round(selfConsumedMin),
      selfConsumedMaxKwh: Math.round(selfConsumedMax),
      exportedMinKwh: Math.round(exportedMin),
      exportedMaxKwh: Math.round(exportedMax),
      savingsMinSar: Math.round(savingsMin),
      savingsMaxSar: Math.round(savingsMax),
    });
  }

  return {
    savingsRange: {
      minSarPerYear: Math.round(totalSavingsMin),
      maxSarPerYear: Math.round(totalSavingsMax),
      minKwhSelfConsumedPerYear: Math.round(totalSelfConsumedMin),
      maxKwhSelfConsumedPerYear: Math.round(totalSelfConsumedMax),
      selfConsumptionRangePct: [scLow * 100, scHigh * 100],
    },
    monthlyBreakdown,
  };
}
