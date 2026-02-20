'use client';

import { useState } from 'react';
import type { RoofConfig } from '@/types';
import { Input } from '@/components/ui/Input';

interface RoofAreaInputProps {
  value: RoofConfig;
  onChange: (roof: Partial<RoofConfig>) => void;
}

const SHADING_LEVELS = [
  { label: 'None', value: 0, description: 'No shading on the roof' },
  { label: 'Partial', value: 5, description: 'Some shading from trees or structures' },
  { label: 'Heavy', value: 15, description: 'Significant shading, large obstructions' },
];

const ORIENTATIONS = [
  { label: 'South (best)', azimuth: 180 },
  { label: 'South-East', azimuth: 135 },
  { label: 'South-West', azimuth: 225 },
  { label: 'East', azimuth: 90 },
  { label: 'West', azimuth: 270 },
  { label: 'North', azimuth: 0 },
];

export function RoofAreaInput({ value, onChange }: RoofAreaInputProps) {
  const [mode, setMode] = useState<'direct' | 'dimensions'>('direct');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [usablePct, setUsablePct] = useState(80);

  function handleDimensions() {
    const l = parseFloat(length);
    const w = parseFloat(width);
    if (!isNaN(l) && !isNaN(w)) {
      onChange({ usableAreaM2: Math.round(l * w * (usablePct / 100)) });
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('direct')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            mode === 'direct'
              ? 'bg-amber-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Enter area directly
        </button>
        <button
          type="button"
          onClick={() => setMode('dimensions')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            mode === 'dimensions'
              ? 'bg-amber-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Enter length × width
        </button>
      </div>

      {mode === 'direct' ? (
        <Input
          label="Usable rooftop area"
          type="number"
          min={10}
          max={5000}
          step={5}
          suffix="m²"
          value={value.usableAreaM2}
          onChange={(e) => onChange({ usableAreaM2: parseFloat(e.target.value) || 0 })}
          hint="Usable = after excluding HVAC units, parapets, walkways, and shaded zones"
        />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Length"
              type="number"
              min={1}
              step={0.5}
              suffix="m"
              value={length}
              onChange={(e) => { setLength(e.target.value); }}
              onBlur={handleDimensions}
            />
            <Input
              label="Width"
              type="number"
              min={1}
              step={0.5}
              suffix="m"
              value={width}
              onChange={(e) => { setWidth(e.target.value); }}
              onBlur={handleDimensions}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Usable portion: {usablePct}%
            </label>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={usablePct}
              onChange={(e) => { setUsablePct(parseInt(e.target.value)); handleDimensions(); }}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>50% (many obstructions)</span>
              <span>100% (clear roof)</span>
            </div>
          </div>
          {value.usableAreaM2 > 0 && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              Usable area: <strong>{value.usableAreaM2} m²</strong>
            </p>
          )}
        </div>
      )}

      {/* Orientation */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Roof orientation <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ORIENTATIONS.map((o) => (
            <button
              key={o.azimuth}
              type="button"
              onClick={() => onChange({ azimuthDeg: o.azimuth, useOptimalAngles: false })}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                value.azimuthDeg === o.azimuth && !value.useOptimalAngles
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onChange({ useOptimalAngles: true })}
          className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
            value.useOptimalAngles
              ? 'bg-amber-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          I don&apos;t know — use PVGIS optimal angles
        </button>
      </div>

      {/* Tilt */}
      {!value.useOptimalAngles && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Tilt angle: {value.tiltDeg}°
          </label>
          <input
            type="range"
            min={0}
            max={45}
            step={1}
            value={value.tiltDeg}
            onChange={(e) => onChange({ tiltDeg: parseInt(e.target.value) })}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>0° (flat)</span>
            <span>22° (optimal KSA)</span>
            <span>45° (steep)</span>
          </div>
        </div>
      )}

      {/* Shading */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">Shading level</label>
        <div className="grid grid-cols-3 gap-2">
          {SHADING_LEVELS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange({ shadingLoss: s.value })}
              title={s.description}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                value.shadingLoss === s.value
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
