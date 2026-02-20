'use client';

import { useState } from 'react';
import type { City } from '@/types';
import { SAUDI_CITIES, getCitiesByRegion } from '@/lib/data/saudiCities';

interface CitySelectorProps {
  value: City | null;
  onChange: (city: City) => void;
}

export function CitySelector({ value, onChange }: CitySelectorProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = search.length > 0
    ? SAUDI_CITIES.filter((c) =>
        c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        c.nameAr.includes(search)
      )
    : null;

  const grouped = filtered
    ? { Results: filtered }
    : getCitiesByRegion();

  const regionOrder = ['Central', 'Western', 'Eastern', 'Northern', 'Southern'];
  const sortedRegions = Object.keys(grouped).sort(
    (a, b) => regionOrder.indexOf(a) - regionOrder.indexOf(b)
  );

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">
        City
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <span className={value ? 'text-slate-900' : 'text-slate-400'}>
            {value ? `${value.nameEn} — ${value.region}` : 'Select a city…'}
          </span>
          <svg className="h-4 w-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg">
            <div className="p-2 border-b border-slate-100">
              <input
                autoFocus
                type="text"
                placeholder="Search cities…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {sortedRegions.map((region) => (
                <div key={region}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">
                    {region}
                  </div>
                  {grouped[region].map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        onChange(city);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-amber-50 text-left"
                    >
                      <span className="text-slate-900">{city.nameEn}</span>
                      <span className="text-slate-400 text-xs">{city.nameAr}</span>
                    </button>
                  ))}
                </div>
              ))}
              {sortedRegions.length === 0 && (
                <p className="px-3 py-4 text-sm text-slate-500 text-center">No cities found</p>
              )}
            </div>
          </div>
        )}
      </div>
      {value && (
        <p className="text-xs text-slate-500">
          Coordinates: {value.lat.toFixed(4)}°N, {value.lon.toFixed(4)}°E · Avg DNI: {value.avgDNI} kWh/m²/day
        </p>
      )}
    </div>
  );
}
