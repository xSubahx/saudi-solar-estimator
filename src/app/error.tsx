'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <AlertTriangle size={48} style={{ color: 'var(--warning)' }} />
        </div>
        <h2
          className="text-xl mb-2"
          style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, color: 'var(--text-primary)' }}
        >
          Something went wrong
        </h2>
        <p
          className="text-sm mb-6"
          style={{ fontFamily: 'var(--font-newsreader)', color: 'var(--text-secondary)' }}
        >
          An unexpected error occurred. Your inputs have not been saved.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
