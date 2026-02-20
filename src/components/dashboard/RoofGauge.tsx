'use client';

import { Card, CardTitle } from '@/components/ui/Card';
import { formatKWp } from '@/lib/utils/formatters';

interface RoofGaugeProps {
  usableAreaM2: number;
  systemKwp: number;
  roofCoverage: number;
  panelCount: number;
}

export function RoofGauge({ usableAreaM2, systemKwp, roofCoverage, panelCount }: RoofGaugeProps) {
  // SVG semicircle gauge parameters
  const size = 160;
  const cx = size / 2;
  const cy = size / 2 + 20;
  const r = 60;
  const strokeWidth = 14;

  // Semicircle from 180° to 0° (left to right), using SVG arc
  const startAngle = Math.PI; // 180°
  const endAngle = 0; // 0°
  const totalArc = Math.PI; // 180°
  const fillArc = (roofCoverage / 100) * totalArc;

  function polarToCartesian(angle: number, radius: number) {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy - radius * Math.sin(angle),
    };
  }

  const trackStart = polarToCartesian(startAngle, r);
  const trackEnd = polarToCartesian(endAngle, r);
  const fillEnd = polarToCartesian(startAngle - fillArc, r); // subtract because SVG y-axis is inverted

  const trackPath = `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 0 1 ${trackEnd.x} ${trackEnd.y}`;
  const fillPath = fillArc > 0
    ? `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${fillArc > Math.PI / 2 ? 1 : 0} 1 ${fillEnd.x} ${fillEnd.y}`
    : '';

  const gaugeColor =
    roofCoverage >= 70 ? '#f59e0b' :
    roofCoverage >= 40 ? '#fbbf24' :
    '#e2e8f0';

  return (
    <Card>
      <CardTitle className="mb-3">Roof Utilisation</CardTitle>
      <div className="flex flex-col items-center">
        <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
          {/* Track */}
          <path
            d={trackPath}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Fill */}
          {fillPath && (
            <path
              d={fillPath}
              fill="none"
              stroke={gaugeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          )}
          {/* Center label */}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="bold" fill="#1e293b">
            {roofCoverage}%
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">
            roof used
          </text>
        </svg>

        <div className="w-full mt-2 space-y-1 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Usable area</span>
            <span className="font-medium">{usableAreaM2} m²</span>
          </div>
          <div className="flex justify-between">
            <span>System size</span>
            <span className="font-medium text-amber-600">{formatKWp(systemKwp)}</span>
          </div>
          <div className="flex justify-between">
            <span>Est. panels</span>
            <span className="font-medium">~{panelCount}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
