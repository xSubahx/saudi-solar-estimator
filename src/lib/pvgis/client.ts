import { ASSUMPTIONS } from '@/lib/data/assumptions';
import type { PVGISQueryParams } from './types';

/**
 * Converts display azimuth convention to PVGIS aspect convention.
 *
 * Display:  0=North, 90=East,  180=South, 270=West
 * PVGIS:    0=South, 90=West, -90=East,   180=North
 *
 * Formula: pvgisAspect = displayAzimuth - 180, normalised to [-180, 180]
 */
export function displayAzimuthToPvgisAspect(displayAzimuth: number): number {
  let aspect = displayAzimuth - 180;
  // Wrap into [-180, 180]
  if (aspect > 180) aspect -= 360;
  if (aspect < -180) aspect += 360;
  return aspect;
}

/**
 * Converts PVGIS aspect back to display azimuth convention.
 * Inverse of displayAzimuthToPvgisAspect.
 */
export function pvgisAspectToDisplayAzimuth(pvgisAspect: number): number {
  let azimuth = pvgisAspect + 180;
  if (azimuth >= 360) azimuth -= 360;
  if (azimuth < 0) azimuth += 360;
  return azimuth;
}

/**
 * Builds the full PVGIS API URL from the given query parameters.
 *
 * Always sets:
 *   pvtechchoice = crystSi   (crystalline silicon — most common commercial panel)
 *   mountingplace = building  (roof-integrated, slightly higher temp losses)
 *   outputformat  = json
 *   browser       = 0        (machine client, not browser)
 */
export function buildPVGISUrl(params: PVGISQueryParams): string {
  const url = new URL(ASSUMPTIONS.pvgis.baseUrl);

  url.searchParams.set('lat', String(params.lat));
  url.searchParams.set('lon', String(params.lon));
  url.searchParams.set('peakpower', String(params.peakpower));
  url.searchParams.set('loss', String(params.loss));
  url.searchParams.set('pvtechchoice', params.pvtechchoice ?? ASSUMPTIONS.pvgis.pvTechnology);
  url.searchParams.set('mountingplace', params.mountingplace ?? 'building');
  url.searchParams.set('outputformat', params.outputformat ?? ASSUMPTIONS.pvgis.outputFormat);
  url.searchParams.set('browser', String(params.browser ?? 0));

  if (params.optimalangles === 1) {
    // Let PVGIS find the best tilt AND azimuth — used when user selects "I don't know"
    url.searchParams.set('optimalangles', '1');
  } else if (params.optimalinclination === 1) {
    // Let PVGIS find the best tilt only; keep user-specified azimuth
    url.searchParams.set('optimalinclination', '1');
    url.searchParams.set('aspect', String(params.aspect));
  } else {
    // Explicit tilt + azimuth
    url.searchParams.set('angle', String(params.angle));
    url.searchParams.set('aspect', String(params.aspect));
  }

  return url.toString();
}
