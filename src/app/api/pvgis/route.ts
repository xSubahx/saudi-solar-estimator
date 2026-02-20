import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { makeCacheKey } from '@/lib/pvgis/cache';
import { buildPVGISUrl } from '@/lib/pvgis/client';

// NOTE: No explicit `runtime = 'edge'` — OpenNext wraps all routes as
// Cloudflare Workers automatically. caches.default is available in all
// Cloudflare Workers via the nodejs_compat compatibility flag.

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

  // Build a deterministic cache key from the six identifying parameters
  const cacheKeyString = makeCacheKey({
    lat: params.lat,
    lon: params.lon,
    peakpower: params.peakpower,
    loss: params.loss,
    angle: params.angle,
    aspect: params.aspect,
  });

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

  // Use Cloudflare Cache API (caches.default) for edge-persistent caching.
  // The internal hostname avoids cache partitioning by request origin.
  const cacheKey = new Request(`https://pvgis-cache.internal/${cacheKeyString}`);
  // caches.default is a Cloudflare Workers extension not in standard DOM types
  const cache = (caches as unknown as { default: Cache }).default;

  // Check cache
  const cachedResp = await cache.match(cacheKey);
  if (cachedResp) {
    const data = await cachedResp.json();
    return NextResponse.json(data, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    const upstreamRes = await fetch(pvgisUrl, {
      headers: { Accept: 'application/json' },
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

    // Store in Cloudflare Cache API (best-effort; awaited so it completes before response)
    // cache.put(cacheKey, new Response(JSON.stringify(data), {
    //   headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' }
    // }));

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
