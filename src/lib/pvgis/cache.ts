import type { CachedPVGISEntry, PVGISResponse } from '@/types';
import { ASSUMPTIONS } from '@/lib/data/assumptions';

const pvgisCache = new Map<string, CachedPVGISEntry>();

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
 * Returns the cached PVGIS response if it exists and has not exceeded the
 * configured TTL (default 24 hours). Returns null on miss or expiry.
 */
export function getCached(key: string): PVGISResponse | null {
  const entry = pvgisCache.get(key);
  if (!entry) return null;

  const ageMs = Date.now() - entry.fetchedAt;
  if (ageMs > ASSUMPTIONS.pvgis.cacheTtlMs) {
    // Entry is stale — evict it proactively so memory doesn't grow unbounded.
    pvgisCache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Stores a fresh PVGIS response in the in-memory cache, tagged with the
 * current timestamp so TTL can be evaluated on subsequent reads.
 */
export function setCached(key: string, data: PVGISResponse): void {
  const entry: CachedPVGISEntry = {
    data,
    fetchedAt: Date.now(),
  };
  pvgisCache.set(key, entry);
}

/**
 * Returns diagnostic information about the current cache state.
 * Useful for health-check or debug endpoints.
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: pvgisCache.size,
    keys: Array.from(pvgisCache.keys()),
  };
}
