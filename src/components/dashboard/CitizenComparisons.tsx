'use client';
import type { CitizenComparisonsData } from '@/types';
import { formatMonthsFree } from '@/lib/utils/formatters';
import { Sunrise, TreePine, Car, Lightbulb } from 'lucide-react';

interface CitizenComparisonsProps {
  comparisons: CitizenComparisonsData;
}

export function CitizenComparisons({ comparisons }: CitizenComparisonsProps) {
  const items = [
    {
      icon: <Sunrise size={28} style={{ color: 'var(--accent)' }} />,
      borderColor: 'var(--accent)',
      label: 'Like getting free electricity for',
      value: formatMonthsFree(comparisons.monthsFreePerYear),
      subtext: 'every year',
    },
    {
      icon: <TreePine size={28} style={{ color: 'var(--success)' }} />,
      borderColor: 'var(--success)',
      label: 'Equivalent to planting',
      value: `${comparisons.treesEquivalentPerYear} trees`,
      subtext: 'annually (CO₂ offset)',
    },
    {
      icon: <Car size={28} style={{ color: 'var(--info)' }} />,
      borderColor: 'var(--info)',
      label: 'Like avoiding',
      value: `${comparisons.carTripsAvoided} car trips`,
      subtext: 'Riyadh → Jeddah per year',
    },
    {
      icon: <Lightbulb size={28} style={{ color: 'var(--warning)' }} />,
      borderColor: 'var(--warning)',
      label: 'Enough electricity for',
      value: `${comparisons.householdsEquivalent} homes`,
      subtext: 'average Saudi household',
    },
  ];

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '24px',
      transition: 'all 0.3s ease-out',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div className="accent-line" />
        <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
          What This Means for You
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              borderLeft: `3px solid ${item.borderColor}`,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span>{item.icon}</span>
            <p style={{ fontSize: '0.7rem', fontFamily: 'var(--font-newsreader)', color: 'var(--text-secondary)', margin: 0 }}>{item.label}</p>
            <p style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-syne)', color: 'var(--accent)', margin: 0 }}>
              {item.value}
            </p>
            <p style={{ fontSize: '0.7rem', fontFamily: 'var(--font-newsreader)', fontStyle: 'italic', color: 'var(--text-tertiary)', margin: 0 }}>{item.subtext}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
