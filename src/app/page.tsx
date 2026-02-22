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
import { Sun, AlertTriangle } from 'lucide-react';

export default function Home() {
  const estimator = useEstimator();
  const { result, isLoading, error } = estimator;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 geo-border"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 85%, transparent)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div
              className="animate-accentPulse"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '2px solid var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sun size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Saudi Solar Estimator
              </h1>
              <p
                className="hidden sm:block"
                style={{
                  fontFamily: 'var(--font-newsreader)',
                  fontStyle: 'italic',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}
              >
                Free solar analysis with PVGIS data &amp; SEC tariffs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs"
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 500,
                backgroundColor: 'var(--info-soft)',
                color: 'var(--info)',
              }}
            >
              PVGIS (JRC)
            </span>
            <span
              className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs"
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 500,
                backgroundColor: 'var(--success-soft)',
                color: 'var(--success)',
              }}
            >
              SEC Tariff
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Input wizard */}
          <div className="lg:col-span-1 animate-slideInLeft">
            <InputForm estimator={estimator} />

            {/* Mobile: show results below form */}
            <div className="lg:hidden mt-8">
              {isLoading && <SkeletonDashboard />}
              {error && <ErrorBanner error={error} />}
              {result && !isLoading && <DashboardContent estimator={estimator} />}
              {!result && !isLoading && !error && <EmptyState />}
            </div>
          </div>

          {/* Right: Dashboard — desktop only (mobile is above) */}
          <div className="hidden lg:block lg:col-span-2">
            {isLoading && <SkeletonDashboard />}
            {error && <ErrorBanner error={error} />}
            {result && !isLoading && <DashboardContent estimator={estimator} />}
            {!result && !isLoading && !error && <EmptyState />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="mt-12 geo-border"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start gap-4">
            <div
              style={{
                width: 2,
                minHeight: 48,
                backgroundColor: 'var(--accent)',
                borderRadius: 1,
                flexShrink: 0,
                opacity: 0.6,
              }}
            />
            <div className="space-y-2">
              <p
                className="text-xs"
                style={{ fontFamily: 'var(--font-newsreader)', color: 'var(--text-secondary)' }}
              >
                Solar irradiance data from{' '}
                <a
                  href="https://re.jrc.ec.europa.eu/pvgis5"
                  style={{ color: 'var(--accent)' }}
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PVGIS v5.3 (Joint Research Centre, European Commission)
                </a>
                . Electricity tariff from{' '}
                <a
                  href="https://www.se.com.sa/en-us/customers/pages/tariff.aspx"
                  style={{ color: 'var(--accent)' }}
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Saudi Electricity Company (SEC)
                </a>
                . Self-consumption range from Fraunhofer ISE.
              </p>
              <p
                className="text-xs"
                style={{
                  fontFamily: 'var(--font-newsreader)',
                  fontStyle: 'italic',
                  color: 'var(--text-tertiary)',
                }}
              >
                Estimates only — not financial advice. Verify with a qualified solar installer before investing.
                Export credit rate is never assumed by this tool.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ErrorBanner({ error }: { error: string }) {
  return (
    <div
      className="animate-fadeUp"
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--danger-soft)',
        border: '1px solid var(--danger)',
        padding: '20px',
      }}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p
            style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              margin: '0 0 4px',
            }}
          >
            Could not fetch solar data
          </p>
          <p
            style={{
              fontFamily: 'var(--font-newsreader)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              margin: '0 0 8px',
            }}
          >
            {error}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-newsreader)',
              fontStyle: 'italic',
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
              margin: 0,
            }}
          >
            PVGIS (the European Commission solar database) may be temporarily unavailable.
            Please try again in a few minutes. Your inputs are preserved.
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardContent({ estimator }: { estimator: ReturnType<typeof useEstimator> }) {
  const { result, inputs } = estimator;
  if (!result) return null;

  return (
    <div className="space-y-6">
      <div className="animate-fadeUp">
        <KPICards result={result} />
      </div>
      {result.citizenComparisons && (
        <div className="animate-fadeUp-delay-1">
          <CitizenComparisons comparisons={result.citizenComparisons} />
        </div>
      )}
      {result.economics && (
        <div className="animate-fadeUp-delay-2">
          <EconomicsCard economics={result.economics} />
        </div>
      )}
      <div className="animate-fadeUp-delay-3">
        <MonthlyChart data={result.monthlyBreakdown} />
      </div>
      <div className="animate-fadeUp-delay-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <RoofGauge
          usableAreaM2={inputs.roof.usableAreaM2}
          systemKwp={result.sizing.systemKwp}
          roofCoverage={result.sizing.roofCoverage}
          panelCount={result.sizing.panelCount}
        />
        <SensitivitySliders estimator={estimator} />
      </div>
      <div className="animate-fadeUp-delay-5">
        <TechnicalAppendix result={result} inputs={inputs} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="gradient-mesh noise-overlay animate-fadeIn"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 320,
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        textAlign: 'center',
        padding: '48px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative geometric star */}
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{
          position: 'absolute',
          opacity: 0.04,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <polygon
          points="100,10 120,80 195,80 135,120 155,195 100,150 45,195 65,120 5,80 80,80"
          fill="currentColor"
        />
      </svg>

      <div
        className="animate-accentPulse"
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          border: '2px solid var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Sun size={32} style={{ color: 'var(--accent)' }} />
      </div>
      <p
        style={{
          fontFamily: 'var(--font-syne)',
          fontWeight: 600,
          fontSize: '1.1rem',
          color: 'var(--text-primary)',
          margin: '0 0 8px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        Your results will appear here
      </p>
      <p
        style={{
          fontFamily: 'var(--font-newsreader)',
          fontStyle: 'italic',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          margin: 0,
          maxWidth: 320,
          position: 'relative',
          zIndex: 1,
        }}
      >
        Complete the 4-step wizard and click &ldquo;Calculate My Solar Savings&rdquo;
      </p>
    </div>
  );
}
