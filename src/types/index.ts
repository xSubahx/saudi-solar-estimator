// ─── City & Location ──────────────────────────────────────────────────────────

export interface City {
  id: string;
  nameEn: string;
  nameAr: string;
  lat: number;
  lon: number;
  region: string;
  avgDNI: number; // kWh/m²/day — informational only; PVGIS is the authority for calculations
}

// ─── User Input Configs ───────────────────────────────────────────────────────

export interface RoofConfig {
  usableAreaM2: number; // 10–500 m² — "usable" means after excluding AC units, parapets, etc.
  tiltDeg: number; // 0–45°; use 22° as default for KSA latitude
  azimuthDeg: number; // 0=N, 90=E, 180=S, 270=W; 180 (south) is optimal in Saudi Arabia
  shadingLoss: number; // additional % loss from shading, 0–25
  useOptimalAngles: boolean; // if true, skip tilt/azimuth and let PVGIS find optimal
}

export interface ConsumptionConfig {
  monthlyKwh: number; // average monthly consumption in kWh
  hasAC: boolean; // used for seasonal profile shape
  summerPeakMultiplier: number; // default 1.8 (Saudi summer ~1.8× winter)
}

export interface AdvancedConfig {
  wPerM2: number; // panel power density W/m²; default 216 (Fraunhofer ~21.6% module eff.)
  packingFactor: number; // fraction of usable area covered by panels; default 1.0
  systemLoss: number; // total system losses %; default 14 (PVGIS baseline)
  inverterEff: number; // inverter efficiency %; default 96
  degradationPct: number; // annual degradation %/yr; default 0.5
  projectLifeYears: number; // default 25
  installCostPerKwp: number; // SAR/kWp; default 3500 (2024 Saudi market)
  omCostPerKwpPerYear: number; // SAR/kWp/yr; default 50
  selfConsumptionOverride: number | null; // user-set SC% (0-1 fraction); null = use default range
}

export interface ExportConfig {
  enabled: boolean;
  // CRITICAL: null means not set — export credit is NEVER assumed or defaulted.
  // The app must not add any export credit unless this is a user-supplied non-null value.
  creditRatePerKwh: number | null;
  utilityProgram: string; // descriptive, e.g. "SEC Net Billing"
}

// ─── Estimator State ──────────────────────────────────────────────────────────

export interface EstimatorInputs {
  city: City | null;
  roof: RoofConfig;
  consumption: ConsumptionConfig;
  advanced: AdvancedConfig;
  export: ExportConfig;
}

export type WizardStep = 'location' | 'roof' | 'consumption' | 'options';

export type SavingsMode = 'conservative' | 'profile' | 'net-billing';

// ─── PVGIS API Response Types ─────────────────────────────────────────────────

export interface PVGISMonthlyOutput {
  month: number; // 1–12
  E_d: number; // average daily energy production (kWh/day)
  E_m: number; // average monthly energy production (kWh/month)
  H_d: number; // average daily irradiation on plane (kWh/m²/day)
  H_m: number; // average monthly irradiation on plane (kWh/m²/month)
  SD_m: number; // standard deviation of monthly production (kWh)
}

export interface PVGISAnnualTotals {
  E_d: number; // average daily energy production (kWh/day)
  E_m: number; // average monthly energy production (kWh/month)
  E_y: number; // annual energy production (kWh/year)
  H_d: number; // average daily irradiation (kWh/m²/day)
  H_m: number; // average monthly irradiation (kWh/m²/month)
  'H(i)_y': number; // annual irradiation (kWh/m²/year)
  SD_m: number; // std dev of monthly production
  SD_y: number; // std dev of annual production
  l_aoi: number; // angle-of-incidence loss (%)
  l_spec: string; // spectral loss (%)
  l_tg: number; // temperature and irradiance loss (%)
  l_total: number; // combined total loss (%)
}

export interface PVGISResponse {
  inputs: {
    location: {
      latitude: number;
      longitude: number;
      elevation: number;
    };
    meteo_data: {
      radiation_db: string;
      meteo_db: string;
      year_min: number;
      year_max: number;
      use_horizon: string;
      horizon_db: string;
    };
    mounting_system: {
      fixed: {
        slope: { value: number; optimal: number };
        azimuth: { value: number; optimal: number };
        type: string;
      };
    };
    pv_module: {
      technology: string;
      peak_power: number;
      system_loss: number;
    };
  };
  outputs: {
    monthly: {
      fixed: PVGISMonthlyOutput[];
    };
    totals: {
      fixed: PVGISAnnualTotals;
    };
  };
  meta: {
    inputs_corrected_for_horizon: string;
  };
}

export interface CachedPVGISEntry {
  data: PVGISResponse;
  fetchedAt: number; // Date.now() timestamp
}

// ─── Calculation Output Types ─────────────────────────────────────────────────

export interface PVSizingResult {
  systemKwp: number; // DC nameplate capacity
  panelCount: number; // approximate panel count at 400W reference
  roofCoverage: number; // % of usable roof area occupied by panels
}

export interface TariffResult {
  monthlyBill: number; // SAR/month
  annualBill: number; // SAR/year
  blendedRate: number; // weighted average SAR/kWh
  tier1Kwh: number; // kWh consumed in tier 1 (≤6000 kWh/mo)
  tier2Kwh: number; // kWh consumed in tier 2 (>6000 kWh/mo)
}

export interface SavingsRange {
  minSarPerYear: number;
  maxSarPerYear: number;
  minKwhSelfConsumedPerYear: number;
  maxKwhSelfConsumedPerYear: number;
  selfConsumptionRangePct: [number, number]; // e.g. [20, 40]
}

export interface MonthlySavingsRow {
  month: string; // "Jan", "Feb", etc.
  monthNum: number; // 1–12
  productionKwh: number;
  consumptionKwh: number;
  selfConsumedMinKwh: number;
  selfConsumedMaxKwh: number;
  exportedMinKwh: number;
  exportedMaxKwh: number;
  savingsMinSar: number;
  savingsMaxSar: number;
}

export interface EconomicsResult {
  simplePaybackYears: number;
  npv25Years: number; // SAR, using configured discount rate
  irr: number; // %
  lcoe: number; // SAR/kWh (levelized cost of energy)
  totalInstallCostSar: number;
  annualSavingsRangeMin: number; // SAR
  annualSavingsRangeMax: number; // SAR
  co2OffsetTonsPerYear: number;
  costPerPanel: number;            // totalInstallCost / panelCount
  costPerKwp: number;              // totalInstallCost / systemKwp
  cumulativeSavings25yr: number;   // sum of 25-year yearly net savings
  monthlySavingsMin: number;       // annualSavingsMin / 12
  monthlySavingsMax: number;       // annualSavingsMax / 12
  co2OffsetTonnesPerYear: number;  // annualProduction * 0.00057
}

export interface CitizenComparisonsData {
  monthsFreePerYear: number;
  treesEquivalentPerYear: number;
  carTripsAvoided: number;
  householdsEquivalent: number;
}

// ─── Full Estimator Result ────────────────────────────────────────────────────

export interface EstimatorResult {
  sizing: PVSizingResult;
  pvgisData: PVGISResponse;
  tariff: TariffResult;
  savings: SavingsRange;
  monthlyBreakdown: MonthlySavingsRow[];
  economics: EconomicsResult | null; // null when no CAPEX provided
  citizenComparisons: CitizenComparisonsData | null; // null when economics are not calculated
  mode: SavingsMode;
  annualProductionKwh: number; // from PVGIS E_y
  computedAt: number; // Date.now()
}
