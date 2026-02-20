import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCached, setCached, makeCacheKey } from '@/lib/pvgis/cache';
import { buildPVGISUrl } from '@/lib/pvgis/client';

// Validate query params strictly to Saudi Arabia's geographic bounding box.
// This prevents proxy abuse and ensures PVGIS will return valid data.
const QuerySchema = z.object({
  lat: z.coerce.number().min(16, 'Latitude too far south').max(32, 'Latitude too far north'),
  lon: z.coerce.number().min(34, 'Longitude too far west').max(56, 'Longitude too far east'),
  peakpower: z.coerce.number().min(0.5, 'System too small').max(5000, 'System too large'),
  loss: z.coerce.number().min(0).max(50),
  angle: z.coerce.number().min(0).max(45).default(22),
  aspect: z.coerce.number().min(-180).max(180).default(0),
  optimalangles: z.coerce.number().int().min(0).max(1).optional(),
  optimalinclination: z.coerce.number().int().min(0).max(1).optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Parse and validate all incoming query parameters
  const parseResult = QuerySchema.safeParse({
    lat: searchParams.get('lat'),
    lon: searchParams.get('lon'),
    peakpower: searchParams.get('peakpower'),
    loss: searchParams.get('loss'),
    angle: searchParams.get('angle'),
    aspect: searchParams.get('aspect'),
    optimalangles: searchParams.get('optimalangles') ?? undefined,
    optimalinclination: searchParams.get('optimalinclination') ?? undefined,
  });

  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: 'Invalid parameters',
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const params = parseResult.data;

  // Check in-memory cache
  const cacheKey = makeCacheKey({
    lat: params.lat,
    lon: params.lon,
    peakpower: params.peakpower,
    loss: params.loss,
    angle: params.angle,
    aspect: params.aspect,
  });

  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'X-Cache-Age': 'cached',
      },
    });
  }

  // Build PVGIS upstream URL
  const pvgisUrl = buildPVGISUrl({
    lat: params.lat,
    lon: params.lon,
    peakpower: params.peakpower,
    loss: params.loss,
    angle: params.angle,
    aspect: params.aspect,
    optimalangles: params.optimalangles as 0 | 1 | undefined,
    optimalinclination: params.optimalinclination as 0 | 1 | undefined,
  });

  try {
    const upstreamRes = await fetch(pvgisUrl, {
      headers: { Accept: 'application/json' },
      // Next.js fetch-level cache — acts as a second caching layer across function instances
      next: { revalidate: 86400 },
    });

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text();
      return NextResponse.json(
        {
          error: 'PVGIS upstream error',
          status: upstreamRes.status,
          upstream: errText.slice(0, 500), // truncate large HTML error pages
        },
        { status: 502 }
      );
    }

    const data = await upstreamRes.json();

    // Store in module-level cache (best-effort; cold starts get a fresh cache)
    setCached(cacheKey, data);

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'Failed to reach PVGIS', message },
      { status: 503 }
    );
  }
}
