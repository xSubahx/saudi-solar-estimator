import type { City } from '@/types';

export const SAUDI_CITIES: City[] = [
  {
    id: 'riyadh',
    nameEn: 'Riyadh',
    nameAr: 'الرياض',
    lat: 24.7136,
    lon: 46.6753,
    region: 'Central',
    avgDNI: 5.8,
  },
  {
    id: 'jeddah',
    nameEn: 'Jeddah',
    nameAr: 'جدة',
    lat: 21.4858,
    lon: 39.1925,
    region: 'Western',
    avgDNI: 5.5,
  },
  {
    id: 'makkah',
    nameEn: 'Makkah',
    nameAr: 'مكة المكرمة',
    lat: 21.3891,
    lon: 39.8579,
    region: 'Western',
    avgDNI: 5.6,
  },
  {
    id: 'madinah',
    nameEn: 'Madinah',
    nameAr: 'المدينة المنورة',
    lat: 24.5247,
    lon: 39.5692,
    region: 'Western',
    avgDNI: 5.7,
  },
  {
    id: 'dammam',
    nameEn: 'Dammam',
    nameAr: 'الدمام',
    lat: 26.4207,
    lon: 50.0888,
    region: 'Eastern',
    avgDNI: 5.4,
  },
  {
    id: 'khobar',
    nameEn: 'Al-Khobar',
    nameAr: 'الخبر',
    lat: 26.2172,
    lon: 50.1971,
    region: 'Eastern',
    avgDNI: 5.4,
  },
  {
    id: 'dhahran',
    nameEn: 'Dhahran',
    nameAr: 'الظهران',
    lat: 26.2361,
    lon: 50.0393,
    region: 'Eastern',
    avgDNI: 5.5,
  },
  {
    id: 'taif',
    nameEn: 'Taif',
    nameAr: 'الطائف',
    lat: 21.2854,
    lon: 40.4158,
    region: 'Western',
    avgDNI: 5.9,
  },
  {
    id: 'tabuk',
    nameEn: 'Tabuk',
    nameAr: 'تبوك',
    lat: 28.3838,
    lon: 36.5550,
    region: 'Northern',
    avgDNI: 6.0,
  },
  {
    id: 'abha',
    nameEn: 'Abha',
    nameAr: 'أبها',
    lat: 18.2164,
    lon: 42.5053,
    region: 'Southern',
    avgDNI: 5.2,
  },
  {
    id: 'jizan',
    nameEn: 'Jizan',
    nameAr: 'جيزان',
    lat: 16.8892,
    lon: 42.5511,
    region: 'Southern',
    avgDNI: 5.1,
  },
  {
    id: 'najran',
    nameEn: 'Najran',
    nameAr: 'نجران',
    lat: 17.4923,
    lon: 44.1277,
    region: 'Southern',
    avgDNI: 5.7,
  },
  {
    id: 'hail',
    nameEn: 'Hail',
    nameAr: 'حائل',
    lat: 27.5114,
    lon: 41.6931,
    region: 'Northern',
    avgDNI: 5.9,
  },
  {
    id: 'buraidah',
    nameEn: 'Buraidah',
    nameAr: 'بريدة',
    lat: 26.3260,
    lon: 43.9750,
    region: 'Central',
    avgDNI: 5.8,
  },
  {
    id: 'jubail',
    nameEn: 'Al Jubail',
    nameAr: 'الجبيل',
    lat: 27.0174,
    lon: 49.6580,
    region: 'Eastern',
    avgDNI: 5.4,
  },
  {
    id: 'yanbu',
    nameEn: 'Yanbu',
    nameAr: 'ينبع',
    lat: 24.0899,
    lon: 38.0618,
    region: 'Western',
    avgDNI: 5.5,
  },
];

export const DEFAULT_CITY = SAUDI_CITIES.find((c) => c.id === 'riyadh')!;

export function findCityById(id: string): City | undefined {
  return SAUDI_CITIES.find((c) => c.id === id);
}

/**
 * Returns the city whose coordinates are closest to the given lat/lon using
 * the Haversine great-circle distance formula.
 */
export function findNearestCity(lat: number, lon: number): City {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  function haversine(city: City): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(city.lat - lat);
    const dLon = toRad(city.lon - lon);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat)) *
        Math.cos(toRad(city.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  let nearest = SAUDI_CITIES[0];
  let minDist = haversine(nearest);

  for (let i = 1; i < SAUDI_CITIES.length; i++) {
    const dist = haversine(SAUDI_CITIES[i]);
    if (dist < minDist) {
      minDist = dist;
      nearest = SAUDI_CITIES[i];
    }
  }

  return nearest;
}

/**
 * Groups all cities by their region.
 * Returns an object whose keys are region names and values are arrays of cities
 * belonging to that region, preserving the original order within each region.
 */
export function getCitiesByRegion(): Record<string, City[]> {
  const result: Record<string, City[]> = {};

  for (const city of SAUDI_CITIES) {
    if (!result[city.region]) {
      result[city.region] = [];
    }
    result[city.region].push(city);
  }

  return result;
}
