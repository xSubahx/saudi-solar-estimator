/**
 * Formats a SAR (Saudi Riyal) monetary value.
 *
 * @example
 * formatSAR(1234.5)              // "SAR 1,235"
 * formatSAR(1234.5, { decimals: 2 }) // "SAR 1,234.50"
 */
export function formatSAR(value: number, options?: { decimals?: number }): string {
  const decimals = options?.decimals ?? 0;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  return `SAR ${formatted}`;
}

/**
 * Formats an energy value in kilowatt-hours.
 *
 * @example
 * formatKWh(36500) // "36,500 kWh"
 */
export function formatKWh(value: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `${formatted} kWh`;
}

/**
 * Formats a system capacity in kilowatt-peak. Trailing zeros after the decimal
 * are trimmed so 21.60 becomes "21.6 kWp".
 *
 * @example
 * formatKWp(21.6)  // "21.6 kWp"
 * formatKWp(21.60) // "21.6 kWp"
 * formatKWp(5)     // "5 kWp"
 */
export function formatKWp(value: number): string {
  // Use up to 3 decimal places and let Intl trim trailing zeros naturally via
  // minimumFractionDigits: 0.
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);
  return `${formatted} kWp`;
}

/**
 * Formats a percentage value. Rounds to whole number by default.
 *
 * @example
 * formatPct(42.7)    // "43%"
 * formatPct(42.7, 1) // "42.7%"
 */
export function formatPct(value: number, decimals?: number): string {
  const d = decimals ?? 0;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(value);
  return `${formatted}%`;
}

/**
 * Formats a SAR range with an optional suffix.
 *
 * @example
 * formatSARRange(1200, 2400, 'SAR/yr') // "SAR 1,200 – 2,400 /yr"
 * formatSARRange(500, 1000)            // "SAR 500 – 1,000"
 */
export function formatSARRange(min: number, max: number, suffix?: string): string {
  const fmtMin = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(min);
  const fmtMax = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(max);

  const range = `SAR ${fmtMin} \u2013 ${fmtMax}`;
  if (suffix) {
    // The suffix already contains the unit (e.g. "SAR/yr"), so we only strip
    // a leading "SAR" portion to avoid duplication and prepend a space + slash.
    // Per spec: formatSARRange(1200, 2400, 'SAR/yr') → "SAR 1,200 – 2,400 /yr"
    const strippedSuffix = suffix.startsWith('SAR') ? suffix.slice(3) : ` ${suffix}`;
    return `${range} ${strippedSuffix}`;
  }
  return range;
}

/**
 * Formats a number of years with correct singular/plural form.
 *
 * @example
 * formatYears(25) // "25 years"
 * formatYears(1)  // "1 year"
 */
export function formatYears(value: number): string {
  return `${value} ${value === 1 ? 'year' : 'years'}`;
}

/**
 * Formats a CO2 offset value in metric tonnes per year.
 * Uses the Unicode subscript character for the "2" in CO₂.
 *
 * @example
 * formatCO2(2.4) // "2.4 tonnes CO₂/yr"
 */
export function formatCO2(tonnes: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(tonnes);
  return `${formatted} tonnes CO\u2082/yr`;
}

/**
 * Formats a generic number with thousands separators and optional decimal places.
 *
 * @example
 * formatNumber(1234567)    // "1,234,567"
 * formatNumber(1234.5, 2)  // "1,234.50"
 */
export function formatNumber(value: number, decimals?: number): string {
  const d = decimals ?? 0;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(value);
}

/**
 * Formats a payback period with context.
 * formatPaybackYears(7.5) → "7.5 years"
 * formatPaybackYears(0.8) → "< 1 year"
 * formatPaybackYears(30)  → "> 25 years"
 */
export function formatPaybackYears(years: number): string {
  if (years < 1) return '< 1 year';
  if (years > 25) return '> 25 years';
  return `${years.toFixed(1)} years`;
}

/**
 * Formats a cost per solar panel.
 * formatCostPerPanel(7000) → "SAR 7,000 / panel"
 */
export function formatCostPerPanel(sar: number): string {
  if (sar <= 0) return 'N/A';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(sar);
  return `SAR ${formatted} / panel`;
}

/**
 * Formats a monthly savings range.
 * formatMonthlySavings(100, 200) → "SAR 100 – 200 / month"
 */
export function formatMonthlySavings(min: number, max: number): string {
  const fmtMin = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(min);
  const fmtMax = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(max);
  return `SAR ${fmtMin} \u2013 ${fmtMax} / month`;
}

/**
 * Formats "months of free electricity" value.
 * formatMonthsFree(2.4) → "2.4 months free"
 */
export function formatMonthsFree(months: number): string {
  if (months <= 0) return '0 months';
  return `${months.toFixed(1)} months free`;
}

/**
 * Formats a cost per kWp value.
 * formatCostPerKwp(3500) → "SAR 3,500 / kWp"
 */
export function formatCostPerKwp(sar: number): string {
  if (sar <= 0) return 'N/A';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(sar);
  return `SAR ${formatted} / kWp`;
}
