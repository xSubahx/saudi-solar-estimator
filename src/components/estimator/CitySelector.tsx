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
      <label
        className="block text-sm font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        City
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-left focus:outline-none focus:ring-2"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            // @ts-ignore
            '--tw-ring-color': 'var(--accent)',
          }}
        >
          <span style={{ color: value ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
            {value ? `${value.nameEn} — ${value.region}` : 'Select a city…'}
          </span>
          <svg
            className="h-4 w-4 flex-shrink-0"
            style={{ color: 'var(--text-tertiary)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div
            className="absolute z-50 mt-1 w-full"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div className="p-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <input
                autoFocus
                type="text"
                placeholder="Search cities…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  // @ts-ignore
                  '--tw-ring-color': 'var(--accent)',
                }}
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {sortedRegions.map((region) => (
                <div key={region}>
                  <div
                    className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-syne)',
                    }}
                  >
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
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--accent-soft)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                      }}
                    >
                      <span style={{ color: 'var(--text-primary)' }}>{city.nameEn}</span>
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{city.nameAr}</span>
                    </button>
                  ))}
                </div>
              ))}
              {sortedRegions.length === 0 && (
                <p
                  className="px-3 py-4 text-sm text-center"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  No cities found
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      {value && (
        <p
          className="text-xs"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ibm-plex-mono)' }}
        >
          Coordinates: {value.lat.toFixed(4)}°N, {value.lon.toFixed(4)}°E · Avg DNI: {value.avgDNI} kWh/m²/day
        </p>
      )}
    </div>
  );
}
