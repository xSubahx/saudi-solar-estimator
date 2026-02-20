// Re-export from @/types for convenient imports within the pvgis module
export type {
  PVGISResponse,
  PVGISMonthlyOutput,
  PVGISAnnualTotals,
  CachedPVGISEntry,
} from '@/types';

// PVGIS API query parameters
export interface PVGISQueryParams {
  lat: number;
  lon: number;
  peakpower: number;
  loss: number;
  angle: number; // tilt 0-45°
  aspect: number; // PVGIS convention: 0=south, 90=west, -90=east
  pvtechchoice?: string;
  mountingplace?: string;
  outputformat?: string;
  browser?: number;
  optimalinclination?: 0 | 1;
  optimalangles?: 0 | 1;
}
