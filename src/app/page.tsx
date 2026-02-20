'use client';

import { useEstimator } from '@/hooks/useEstimator';
import { InputForm } from '@/components/estimator/InputForm';
import { KPICards } from '@/components/dashboard/KPICards';
import { MonthlyChart } from '@/components/dashboard/MonthlyChart';
import { SensitivitySliders } from '@/components/dashboard/SensitivitySliders';
import { RoofGauge } from '@/components/dashboard/RoofGauge';
import { EconomicsCard } from '@/components/dashboard/EconomicsCard';
import { CitizenComparisons } from '@/components/dashboard/CitizenComparisons';
import { TechnicalAppendix } from '@/components/dashboard/TechnicalAppendix';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function Home() {
  const estimator = useEstimator();
  const { result, isLoading, error } = estimator;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 shadow-sm border-b"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☀️</span>
            <div>
              <h1 className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>Saudi Solar Estimator</h1>
              <p className="text-xs hidden sm:block" style={{ color: 'var(--text-secondary)' }}>Free · PVGIS data · SEC tariffs · No account needed</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="hidden md:inline">Data:</span>
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">PVGIS (JRC)</span>
            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">SEC Tariff</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Input wizard */}
          <div className="lg:col-span-1">
            <InputForm estimator={estimator} />

            {/* Mobile: show results below form */}
            <div className="lg:hidden mt-6">
              {isLoading && <SkeletonDashboard />}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                  <p className="font-medium">Error fetching solar data</p>
                  <p className="mt-1 text-red-600">{error}</p>
                  <p className="mt-2 text-xs text-red-500">
                    If this persists, PVGIS may be temporarily unavailable. Try again in a few minutes.
                  </p>
                </div>
              )}
              {result && !isLoading && <DashboardContent estimator={estimator} />}
              {!result && !isLoading && !error && <EmptyState />}
            </div>
          </div>

          {/* Right: Dashboard — desktop only (mobile is above) */}
          <div className="hidden lg:block lg:col-span-2">
            {isLoading && <SkeletonDashboard />}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-5 text-sm text-red-700">
                <p className="font-semibold text-base">Could not fetch solar data</p>
                <p className="mt-1">{error}</p>
                <p className="mt-2 text-xs text-red-500">
                  PVGIS (the European Commission solar database) may be temporarily unavailable.
                  Please try again in a few minutes. Your inputs are preserved.
                </p>
              </div>
            )}
            {result && !isLoading && <DashboardContent estimator={estimator} />}
            {!result && !isLoading && !error && <EmptyState />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="mt-12 border-t"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-6 text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
          <p>
            Solar irradiance data from{' '}
            <a href="https://re.jrc.ec.europa.eu/pvgis5" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              PVGIS v5.3 (Joint Research Centre, European Commission)
            </a>
            . Electricity tariff from{' '}
            <a href="https://www.se.com.sa/en-us/customers/pages/tariff.aspx" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Saudi Electricity Company (SEC)
            </a>
            . Self-consumption range from Fraunhofer ISE.
          </p>
          <p style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
            Estimates only — not financial advice. Verify with a qualified solar installer before investing.
            Export credit rate is never assumed by this tool.
          </p>
        </div>
      </footer>
    </div>
  );
}

function DashboardContent({ estimator }: { estimator: ReturnType<typeof useEstimator> }) {
  const { result, inputs } = estimator;
  if (!result) return null;

  return (
    <div className="space-y-5">
      <KPICards result={result} />
      {result.citizenComparisons && (
        <CitizenComparisons comparisons={result.citizenComparisons} />
      )}
      {result.economics && (
        <EconomicsCard economics={result.economics} />
      )}
      <MonthlyChart data={result.monthlyBreakdown} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <RoofGauge
          usableAreaM2={inputs.roof.usableAreaM2}
          systemKwp={result.sizing.systemKwp}
          roofCoverage={result.sizing.roofCoverage}
          panelCount={result.sizing.panelCount}
        />
        <SensitivitySliders estimator={estimator} />
      </div>
      <TechnicalAppendix result={result} inputs={inputs} />
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed text-center px-8"
      style={{ borderColor: 'var(--border)' }}
    >
      <span className="text-4xl mb-3">☀️</span>
      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Your results will appear here</p>
      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
        Complete the 4-step wizard and click &ldquo;Calculate My Solar Savings&rdquo;
      </p>
    </div>
  );
}
