'use client';

import {
  ComposedChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlySavingsRow } from '@/types';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useThemeColors } from '@/hooks/useThemeColors';

interface MonthlyChartProps {
  data: MonthlySavingsRow[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as MonthlySavingsRow;
  return (
    <div style={{
      backgroundColor: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      padding: '12px',
      fontSize: '0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{label}</p>
      <p style={{ color: 'var(--accent)', margin: 0 }}>Production: {d.productionKwh.toLocaleString()} kWh</p>
      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Consumption: {d.consumptionKwh.toLocaleString()} kWh</p>
      <p style={{ color: 'var(--success)', fontWeight: 500, margin: 0 }}>
        Savings: SAR {d.savingsMinSar.toLocaleString()} – {d.savingsMaxSar.toLocaleString()}
      </p>
    </div>
  );
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const themeColors = useThemeColors();

  const chartData = data.map((row) => ({
    month: row.month,
    production: row.productionKwh,
    consumption: row.consumptionKwh,
    savingsMin: row.savingsMinSar,
    savingsMax: row.savingsMaxSar,
    productionKwh: row.productionKwh,
    consumptionKwh: row.consumptionKwh,
    savingsMinSar: row.savingsMinSar,
    savingsMaxSar: row.savingsMaxSar,
  }));

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardTitle>Monthly Production vs Consumption</CardTitle>
        <div className="flex gap-2">
          <Badge variant="warning">Solar production</Badge>
          <Badge variant="success">Savings range</Badge>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: themeColors.textSecondary }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="kwh"
            orientation="left"
            tick={{ fontSize: 10, fill: themeColors.textSecondary }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            label={{ value: 'kWh', angle: -90, position: 'insideLeft', fontSize: 10, fill: themeColors.textSecondary }}
          />
          <YAxis
            yAxisId="sar"
            orientation="right"
            tick={{ fontSize: 10, fill: themeColors.textSecondary }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
            label={{ value: 'SAR', angle: 90, position: 'insideRight', fontSize: 10, fill: themeColors.textSecondary }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: themeColors.textSecondary }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                production: 'Solar Production (kWh)',
                consumption: 'Consumption (kWh)',
                savingsMax: 'Savings High (SAR)',
                savingsMin: 'Savings Low (SAR)',
              };
              return labels[value] ?? value;
            }}
          />
          {/* Solar production bars */}
          <Bar yAxisId="kwh" dataKey="production" fill={themeColors.accent} radius={[3, 3, 0, 0]} name="production" maxBarSize={32} />
          {/* Consumption line */}
          <Line yAxisId="kwh" type="monotone" dataKey="consumption" stroke={themeColors.textSecondary} strokeWidth={1.5} dot={false} name="consumption" strokeDasharray="4 4" />
          {/* Savings range shading */}
          <Area yAxisId="sar" type="monotone" dataKey="savingsMax" fill={themeColors.success} stroke="none" name="savingsMax" fillOpacity={0.15} />
          {/* Savings min/max lines */}
          <Line yAxisId="sar" type="monotone" dataKey="savingsMin" stroke={themeColors.success} strokeWidth={1.5} dot={false} name="savingsMin" />
          <Line yAxisId="sar" type="monotone" dataKey="savingsMax" stroke={themeColors.success} strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
        </ComposedChart>
      </ResponsiveContainer>
      <p style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-newsreader)', fontStyle: 'italic', fontSize: '0.75rem', marginTop: '8px', textAlign: 'center' }}>
        Shaded green band = savings range (conservative 20–40% self-consumption). Dashed grey line = monthly average consumption.
      </p>
    </Card>
  );
}
