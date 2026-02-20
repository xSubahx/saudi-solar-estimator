import type { PVSizingResult, RoofConfig, AdvancedConfig } from '@/types';

// Reference panel wattage for estimating panel count.
// 400W is a representative commercial mono-PERC panel (2023–2024).
const REFERENCE_PANEL_WATTS = 400;

/**
 * Sizes the PV system from usable roof area.
 *
 * Formula: kWp = usableAreaM2 × (wPerM2 / 1000) × packingFactor
 *
 * QUALITY GATE:
 *   usableAreaM2=100, wPerM2=216, packingFactor=1.0 → systemKwp = 21.6 kWp exactly.
 *
 * Important: This function returns the DC nameplate capacity. System losses
 * are applied INSIDE PVGIS when we pass the `loss` parameter. Never apply
 * them here — that would double-count the losses.
 *
 * packingFactor=1.0 is correct when the user has already provided the
 * "usable module area" (i.e., after excluding AC units, parapets, walkways,
 * and shading zones). Use 0.7–0.9 only if working from a gross roof area.
 */
export function calculatePVSizing(
  roof: RoofConfig,
  advanced: AdvancedConfig
): PVSizingResult {
  const systemKwp = roof.usableAreaM2 * (advanced.wPerM2 / 1000) * advanced.packingFactor;

  // Round to 2 decimal places — PVGIS peakpower param accepts this precision
  const roundedKwp = Math.round(systemKwp * 100) / 100;

  const panelCount = Math.floor((roundedKwp * 1000) / REFERENCE_PANEL_WATTS);

  // Back-calculate actual area used by the rounded panel count
  const actualKwp = (panelCount * REFERENCE_PANEL_WATTS) / 1000;
  const actualAreaUsed =
    actualKwp / ((advanced.wPerM2 / 1000) * advanced.packingFactor);
  const roofCoverage = Math.min(100, Math.round((actualAreaUsed / roof.usableAreaM2) * 100));

  return {
    systemKwp: roundedKwp,
    panelCount,
    roofCoverage,
  };
}

/**
 * Converts display azimuth convention to PVGIS aspect convention.
 *
 * Display:  0=North, 90=East,  180=South, 270=West
 * PVGIS:    0=South, 90=West, -90=East,   ±180=North
 *
 * South-facing (display=180) maps to PVGIS aspect=0 (optimal in Saudi Arabia).
 */
export function displayAzimuthToPvgis(displayAzimuth: number): number {
  let aspect = displayAzimuth - 180;
  if (aspect > 180) aspect -= 360;
  if (aspect < -180) aspect += 360;
  return aspect;
}

/** Converts PVGIS aspect back to display azimuth. */
export function pvgisAspectToDisplay(pvgisAspect: number): number {
  let azimuth = pvgisAspect + 180;
  if (azimuth >= 360) azimuth -= 360;
  if (azimuth < 0) azimuth += 360;
  return azimuth;
}
