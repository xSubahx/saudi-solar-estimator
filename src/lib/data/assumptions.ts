/**
 * Single source of truth for all numeric assumptions and defaults.
 *
 * RULES:
 * 1. Every number used in calculations MUST come from here — never hardcode in calc files.
 * 2. Every entry MUST have a source citation.
 * 3. Update lastVerified when you confirm a value is still current.
 */

export const ASSUMPTIONS = {
  tariff: {
    tier1MaxKwhPerMonth: 6000,
    tier1RateSarPerKwh: 0.18,
    tier2RateSarPerKwh: 0.30,
    source:
      'Saudi Electricity Company (SEC) residential tariff, effective Jan 2018. https://www.se.com.sa/en-us/customers/pages/tariff.aspx',
    lastVerified: '2024-11',
    note:
      'Commercial rates differ slightly; this tool defaults to residential. Custom rate input overrides all tiers.',
  },

  pvSystem: {
    defaultWPerM2: 216,
    // 216 W/m² = ~21.6% module efficiency (commercial mono-PERC, 2022–2024 generation)
    // Formula: kWp = usableAreaM2 × (wPerM2 / 1000) × packingFactor
    defaultPackingFactor: 1.0,
    // packingFactor = 1.0 means the user already provided "usable module area"
    // (area after excluding parapets, HVAC, walkways, shading zones).
    // Use 0.7–0.9 if user gives gross roof area and wants packing deducted.
    defaultSystemLossPercent: 14,
    // System losses include: wiring, mismatch, soiling, DC/AC conversion, reflection.
    // PVGIS API default is 14%; this is applied inside PVGIS, not in our calc layer.
    defaultInverterEffPercent: 96,
    defaultDegradationPctPerYear: 0.5,
    // Conservative estimate. Fraunhofer ISE (2012) found median ~0.5%/yr for Si modules.
    // Best-in-class modern modules: ~0.15–0.25%/yr.
    source:
      'Fraunhofer ISE 2012 "Photovoltaics Report" for degradation; PVGIS documentation for system loss default. https://joint-research-centre.ec.europa.eu/pvgis-photovoltaic-geographical-information-system_en',
  },

  selfConsumption: {
    conservativeLow: 0.35,
    // 35% self-consumption: Saudi residential with daytime AC load — lower bound
    // Saudi AC load peaks midday-afternoon (40-50% of total demand), naturally
    // coinciding with solar production hours. This is significantly higher than
    // the Fraunhofer ISE European baseline of 20% for daytime-absent households.
    conservativeHigh: 0.55,
    // 55% self-consumption: Saudi household with heavy daytime AC and occupancy
    // GCC studies show 35-60% without batteries for AC-heavy residential profiles.
    profileLow: 0.50, // stub for v2 load-profile mode
    profileHigh: 0.70,
    source:
      'Adjusted for Saudi Arabia from Fraunhofer ISE 2015 baseline (20–40% for European residential). Saudi AC load peaks during solar production hours, raising self-consumption to 35–55% without batteries (GCC residential studies). Original: https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/recent-facts-about-photovoltaics-in-germany.pdf',
    rationale:
      'A range is shown instead of a single value because self-consumption is highly sensitive to occupancy patterns and appliance timing. Saudi defaults (35–55%) are higher than European values (20–40%) because heavy daytime AC load naturally coincides with solar production. Without 15-min smart-meter data, exact self-consumption cannot be determined.',
  },

  economics: {
    defaultInstallCostSarPerKwp: 3500,
    // SAR/kWp all-in installed cost (panels + inverter + mounting + cabling + labour).
    // Saudi market 2023–2024 range: SAR 2,800–4,500/kWp depending on system size and vendor.
    defaultOmCostSarPerKwpPerYear: 50,
    discountRatePercent: 5,
    // Real (inflation-adjusted) discount rate for SAR-denominated investment.
    // Saudi bank deposit rates 2024: ~4–5%. Using 5% is conservative.
    projectLifeYears: 25,
    // IEC 61730 / IEC 61215 module design lifetime. Top-tier manufacturers warrant 25–30 yr.
    gridCO2IntensityKgPerKwh: 0.57,
    // Saudi Arabia national grid average CO2 intensity.
    // IEA (2022) Electricity CO2 Emissions Factor, Saudi Arabia.
    source:
      'Install cost: REPDO Saudi Arabia 2023 market survey & Enerdata. CO2 factor: IEA 2022 Electricity CO2 Emissions Factors. Discount rate: Saudi bank market rates 2024.',
  },

  pvgis: {
    baseUrl: 'https://re.jrc.ec.europa.eu/api/v5_3/PVcalc',
    cacheTtlMs: 24 * 60 * 60 * 1000, // 24 hours in ms
    pvTechnology: 'crystSi', // crystalline silicon — most common commercial module type
    outputFormat: 'json',
    source:
      'Joint Research Centre PVGIS v5.3, European Commission. https://re.jrc.ec.europa.eu/pvgis5',
    note:
      'Primary radiation database: PVGIS-SARAH3 (best coverage for KSA/Middle East). Fallback: PVGIS-ERA5.',
  },

  netBilling: {
    exportCreditNote:
      "Saudi SEC's net-billing/net-metering pilot program sets export credit rates contractually. Rates vary by customer category, region, and agreement date. This tool NEVER assumes an export credit rate — the field must be left blank unless you have a confirmed rate from your SEC agreement.",
    source:
      'Saudi Vision 2030 Renewable Energy Program, REPDO Net Metering Guidelines (2018+). https://www.repdo.gov.sa',
  },
} as const;

export type AssumptionsType = typeof ASSUMPTIONS;
