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

interface MonthlyChartProps {
  data: MonthlySavingsRow[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as MonthlySavingsRow;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-amber-600">Production: {d.productionKwh.toLocaleString()} kWh</p>
      <p className="text-slate-600">Consumption: {d.consumptionKwh.toLocaleString()} kWh</p>
      <p className="text-green-700 font-medium">
        Savings: SAR {d.savingsMinSar.toLocaleString()} – {d.savingsMaxSar.toLocaleString()}
      </p>
    </div>
  );
}

export function MonthlyChart({ data }: MonthlyChartProps) {
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
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="kwh"
            orientation="left"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            label={{ value: 'kWh', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
          />
          <YAxis
            yAxisId="sar"
            orientation="right"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
            label={{ value: 'SAR', angle: 90, position: 'insideRight', fontSize: 10, fill: '#94a3b8' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#64748b' }}
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
          {/* Solar production bars — amber */}
          <Bar yAxisId="kwh" dataKey="production" fill="#f59e0b" radius={[3, 3, 0, 0]} name="production" maxBarSize={32} />
          {/* Consumption line */}
          <Line yAxisId="kwh" type="monotone" dataKey="consumption" stroke="#94a3b8" strokeWidth={1.5} dot={false} name="consumption" strokeDasharray="4 4" />
          {/* Savings range shading */}
          <Area yAxisId="sar" type="monotone" dataKey="savingsMax" fill="#bbf7d0" stroke="none" name="savingsMax" fillOpacity={0.5} />
          {/* Savings min/max lines */}
          <Line yAxisId="sar" type="monotone" dataKey="savingsMin" stroke="#16a34a" strokeWidth={1.5} dot={false} name="savingsMin" />
          <Line yAxisId="sar" type="monotone" dataKey="savingsMax" stroke="#15803d" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 mt-2 text-center">
        Shaded green band = savings range (conservative 20–40% self-consumption). Dashed grey line = monthly average consumption.
      </p>
    </Card>
  );
}
