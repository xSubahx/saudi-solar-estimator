import type { CitizenComparisonsData, EconomicsResult, PVSizingResult, AdvancedConfig } from '@/types';
import { ASSUMPTIONS } from '@/lib/data/assumptions';

/**
 * Calculates financial metrics for the solar investment.
 *
 * Only meaningful when the user has provided an installation cost (installCostPerKwp > 0).
 * The caller should check this before calling.
 *
 * Uses mid-case savings ((min + max) / 2) for NPV, IRR, and simple payback.
 * The full range is preserved in the output for display purposes.
 *
 * Degradation is applied as compound annual reduction to solar production-derived savings:
 *   yearSavings(n) = midSavings × (1 − degradationPct/100)^(n−1)
 */
export function calculateEconomics(
  sizing: PVSizingResult,
  advanced: AdvancedConfig,
  annualProductionKwh: number,
  annualSavingsMin: number,
  annualSavingsMax: number
): EconomicsResult {
  const totalInstallCostSar = sizing.systemKwp * advanced.installCostPerKwp;
  const annualOM = sizing.systemKwp * advanced.omCostPerKwpPerYear;
  const midSavings = (annualSavingsMin + annualSavingsMax) / 2;
  const discountRate = ASSUMPTIONS.economics.discountRatePercent / 100;
  const life = advanced.projectLifeYears;
  const degradation = advanced.degradationPct / 100;

  // Simple payback: total cost divided by net first-year savings (mid-case, after O&M)
  const netFirstYearSavings = Math.max(midSavings - annualOM, 1); // avoid div-by-zero
  const simplePaybackYears = totalInstallCostSar / netFirstYearSavings;

  // NPV: discounted cash flows over project lifetime
  // Cash flow in year n = midSavings × (1-deg)^(n-1) − annualOM
  let npv = -totalInstallCostSar;
  let totalDiscountedEnergy = 0;

  for (let year = 1; year <= life; year++) {
    const degradationFactor = Math.pow(1 - degradation, year - 1);
    const yearSavings = midSavings * degradationFactor - annualOM;
    const discountFactor = Math.pow(1 + discountRate, year);
    npv += yearSavings / discountFactor;
    totalDiscountedEnergy += (annualProductionKwh * degradationFactor) / discountFactor;
  }

  // LCOE: levelized cost of energy = initial investment / discounted lifetime energy
  // (O&M not included in simplified LCOE to keep comparison clean)
  const lcoe = totalInstallCostSar / Math.max(totalDiscountedEnergy, 1);

  // IRR: Newton-Raphson approximation
  const irr = estimateIRR(totalInstallCostSar, midSavings, annualOM, life, degradation);

  // CO2 offset: grid emission factor × annual production
  const co2OffsetTonsPerYear =
    (annualProductionKwh * ASSUMPTIONS.economics.gridCO2IntensityKgPerKwh) / 1000;

  // New citizen-friendly metrics
  const costPerPanel = sizing.panelCount > 0 ? totalInstallCostSar / sizing.panelCount : 0;
  const costPerKwp = sizing.systemKwp > 0 ? totalInstallCostSar / sizing.systemKwp : 0;

  // Cumulative 25-year savings: sum yearly net savings over 25 years minus initial investment
  let cumulativeSavings25yr = -totalInstallCostSar;
  for (let year = 0; year < 25; year++) {
    const degradationFactor = Math.pow(1 - degradation, year);
    const yearNetSaving = midSavings * degradationFactor - annualOM;
    cumulativeSavings25yr += yearNetSaving;
  }

  const monthlySavingsMin = annualSavingsMin / 12;
  const monthlySavingsMax = annualSavingsMax / 12;
  const co2OffsetTonnesPerYear = annualProductionKwh * 0.00057;

  return {
    simplePaybackYears: Math.round(simplePaybackYears * 10) / 10,
    npv25Years: Math.round(npv),
    irr: Math.round(irr * 10) / 10,
    lcoe: Math.round(lcoe * 1000) / 1000,
    totalInstallCostSar: Math.round(totalInstallCostSar),
    annualSavingsRangeMin: annualSavingsMin,
    annualSavingsRangeMax: annualSavingsMax,
    co2OffsetTonsPerYear: Math.round(co2OffsetTonsPerYear * 10) / 10,
    costPerPanel: Math.round(costPerPanel),
    costPerKwp: Math.round(costPerKwp),
    cumulativeSavings25yr: Math.round(cumulativeSavings25yr),
    monthlySavingsMin: Math.round(monthlySavingsMin * 100) / 100,
    monthlySavingsMax: Math.round(monthlySavingsMax * 100) / 100,
    co2OffsetTonnesPerYear: Math.round(co2OffsetTonnesPerYear * 100) / 100,
  };
}

/**
 * Estimates IRR using Newton-Raphson iteration.
 *
 * Solves: NPV(rate) = 0
 * Starting guess: 10%. Runs up to 20 iterations or until |NPV| < 0.01.
 *
 * Returns the IRR as a percentage (e.g., 12.5 for 12.5%).
 * Returns 0 if the project never becomes profitable.
 */
function estimateIRR(
  initialCost: number,
  annualSavings: number,
  annualOM: number,
  life: number,
  degradation: number
): number {
  let rate = 0.10; // initial guess: 10%

  for (let iter = 0; iter < 20; iter++) {
    let npv = -initialCost;
    let dnpv = 0; // derivative of NPV with respect to rate

    for (let year = 1; year <= life; year++) {
      const degradationFactor = Math.pow(1 - degradation, year - 1);
      const cf = (annualSavings - annualOM) * degradationFactor;
      const discount = Math.pow(1 + rate, year);
      npv += cf / discount;
      dnpv -= (year * cf) / Math.pow(1 + rate, year + 1);
    }

    if (Math.abs(npv) < 0.01) break;
    if (dnpv === 0) break;

    rate = rate - npv / dnpv;

    // Clamp to avoid divergence
    if (rate < -0.99) rate = -0.99;
    if (rate > 10) rate = 10; // 1000% IRR is nonsensical
  }

  // If IRR is negative, the project never recoups its cost — return 0
  return rate > -0.99 ? rate * 100 : 0;
}

export function calculateCitizenComparisons(
  annualSavingsMid: number,
  monthlyBillBefore: number,
  co2TonnesPerYear: number,
  annualProductionKwh: number
): CitizenComparisonsData {
  return {
    monthsFreePerYear: monthlyBillBefore > 0 ? annualSavingsMid / monthlyBillBefore : 0,
    treesEquivalentPerYear: Math.round(co2TonnesPerYear * 1000 / 21),
    carTripsAvoided: Math.round(co2TonnesPerYear * 1000 / 180),
    householdsEquivalent: Number((annualProductionKwh / 36000).toFixed(1)),
  };
}
