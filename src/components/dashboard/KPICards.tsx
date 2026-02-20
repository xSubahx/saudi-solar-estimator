'use client';

import type { EstimatorResult } from '@/types';
import { Card } from '@/components/ui/Card';
import { formatKWp, formatKWh, formatSARRange, formatPct, formatYears } from '@/lib/utils/formatters';

interface KPICardsProps {
  result: EstimatorResult;
}

interface KPICardProps {
  title: string;
  value: string;
  sub?: string;
  accent?: string;
  icon?: string;
}

function KPICard({ title, value, sub, accent = 'text-slate-900', icon }: KPICardProps) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
        {icon && <span>{icon}</span>}
        {title}
      </span>
      <span className={`text-xl font-bold leading-tight ${accent}`}>{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </Card>
  );
}

export function KPICards({ result }: KPICardsProps) {
  const { sizing, annualProductionKwh, savings, tariff, economics } = result;

  const annualConsumption = tariff.annualBill / tariff.blendedRate;
  const offsetPct = annualConsumption > 0
    ? Math.min(100, Math.round((savings.maxKwhSelfConsumedPerYear / annualConsumption) * 100))
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPICard
        icon="⚡"
        title="Max PV Size"
        value={formatKWp(sizing.systemKwp)}
        sub={`~${sizing.panelCount} panels`}
        accent="text-amber-600"
      />
      <KPICard
        icon="☀️"
        title="Annual Production"
        value={formatKWh(annualProductionKwh)}
        sub="from PVGIS data"
        accent="text-amber-600"
      />
      <KPICard
        icon="💰"
        title="Estimated Savings"
        value={formatSARRange(savings.minSarPerYear, savings.maxSarPerYear)}
        sub={`Self-consumption ${savings.selfConsumptionRangePct[0]}–${savings.selfConsumptionRangePct[1]}%`}
        accent="text-green-700"
      />
      <KPICard
        icon="📊"
        title="Consumption Offset"
        value={formatPct(offsetPct)}
        sub="up to (conservative)"
        accent="text-blue-700"
      />
      {economics && economics.simplePaybackYears > 0 && economics.simplePaybackYears < 50 && (
        <KPICard
          icon="📅"
          title="Simple Payback"
          value={formatYears(economics.simplePaybackYears)}
          sub={`NPV: SAR ${economics.npv25Years.toLocaleString()}`}
          accent="text-purple-700"
        />
      )}
      {economics && (
        <KPICard
          icon="🌱"
          title="CO₂ Offset"
          value={`${economics.co2OffsetTonsPerYear} t/yr`}
          sub="at 0.57 kg CO₂/kWh"
          accent="text-green-700"
        />
      )}
    </div>
  );
}
