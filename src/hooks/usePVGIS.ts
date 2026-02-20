'use client';

import { useState, useCallback } from 'react';
import type { PVGISResponse } from '@/types';

interface UsePVGISState {
  data: PVGISResponse | null;
  isLoading: boolean;
  error: string | null;
  isCacheHit: boolean;
}

interface FetchPVGISParams {
  lat: number;
  lon: number;
  peakpower: number;
  loss: number;
  angle: number;
  aspect: number;
  optimalangles?: 1;
  optimalinclination?: 1;
}

export function usePVGIS() {
  const [state, setState] = useState<UsePVGISState>({
    data: null,
    isLoading: false,
    error: null,
    isCacheHit: false,
  });

  const fetchPVGIS = useCallback(async (params: FetchPVGISParams): Promise<PVGISResponse | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const searchParams = new URLSearchParams({
        lat: String(params.lat),
        lon: String(params.lon),
        peakpower: String(params.peakpower),
        loss: String(params.loss),
        angle: String(params.angle),
        aspect: String(params.aspect),
      });

      if (params.optimalangles === 1) {
        searchParams.set('optimalangles', '1');
      } else if (params.optimalinclination === 1) {
        searchParams.set('optimalinclination', '1');
      }

      const res = await fetch(`/api/pvgis?${searchParams.toString()}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error((err as { error?: string }).error ?? `PVGIS request failed (${res.status})`);
      }

      const data: PVGISResponse = await res.json();
      const isCacheHit = res.headers.get('X-Cache') === 'HIT';

      setState({ data, isLoading: false, error: null, isCacheHit });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch solar data';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null, isCacheHit: false });
  }, []);

  return { ...state, fetchPVGIS, reset };
}
