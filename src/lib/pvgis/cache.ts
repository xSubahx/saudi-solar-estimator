// NOTE: On Cloudflare Pages edge runtime, caching is handled by caches.default in the route.
// The in-memory Map-based cache is not viable on edge runtimes because each request can be
// served by a different edge worker instance with its own isolated memory. The functions
// below are retained as no-op stubs for import compatibility; all real caching logic has
// been moved inline into src/app/api/pvgis/route.ts using the Web Cache API (caches.default).

import type { PVGISResponse } from '@/types';

/**
 * Builds a deterministic cache key from the six parameters that uniquely
 * identify a PVGIS request. Lat/lon are rounded to 4 decimal places
 * (~11 m precision) to improve the cache hit rate for near-identical locations.
 */
export function makeCacheKey(params: {
  lat: number;
  lon: number;
  peakpower: number;
  loss: number;
  angle: number;
  aspect: number;
}): string {
  return [
    params.lat.toFixed(4),
    params.lon.toFixed(4),
    params.peakpower.toFixed(2),
    params.loss.toFixed(1),
    params.angle.toFixed(0),
    params.aspect.toFixed(0),
  ].join('|');
}

/**
 * No-op stub. Caching is now handled by the Cloudflare Cache API (caches.default)
 * directly in the route handler. This function always returns null.
 */
export function getCached(_key: string): PVGISResponse | null {
  return null;
}

/**
 * No-op stub. Caching is now handled by the Cloudflare Cache API (caches.default)
 * directly in the route handler. This function does nothing.
 */
export function setCached(_key: string, _data: PVGISResponse): void {
  // no-op on edge runtime — see caches.default usage in route.ts
}

/**
 * No-op stub. Cache stats are not meaningful on a stateless edge runtime.
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return { size: 0, keys: [] };
}
