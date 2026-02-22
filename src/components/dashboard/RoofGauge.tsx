'use client';

import { Card, CardTitle } from '@/components/ui/Card';
import { formatKWp } from '@/lib/utils/formatters';
import { useThemeColors } from '@/hooks/useThemeColors';

interface RoofGaugeProps {
  usableAreaM2: number;
  systemKwp: number;
  roofCoverage: number;
  panelCount: number;
}

export function RoofGauge({ usableAreaM2, systemKwp, roofCoverage, panelCount }: RoofGaugeProps) {
  const themeColors = useThemeColors();

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
    roofCoverage >= 70 ? themeColors.accent :
    roofCoverage >= 40 ? '#FACC15' :
    themeColors.border;

  return (
    <Card>
      <CardTitle className="mb-3">Roof Utilisation</CardTitle>
      <div className="flex flex-col items-center">
        <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
          {/* Track */}
          <path
            d={trackPath}
            fill="none"
            stroke={themeColors.border}
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
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="bold" fill={themeColors.textPrimary} fontFamily="var(--font-syne)">
            {roofCoverage}%
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill={themeColors.textSecondary}>
            roof used
          </text>
        </svg>

        <div className="w-full mt-2 space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex justify-between">
            <span>Usable area</span>
            <span style={{ fontWeight: 500, fontFamily: 'var(--font-ibm-plex-mono)' }}>{usableAreaM2} m²</span>
          </div>
          <div className="flex justify-between">
            <span>System size</span>
            <span style={{ fontWeight: 500, fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--accent)' }}>{formatKWp(systemKwp)}</span>
          </div>
          <div className="flex justify-between">
            <span>Est. panels</span>
            <span style={{ fontWeight: 500, fontFamily: 'var(--font-ibm-plex-mono)' }}>~{panelCount}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
