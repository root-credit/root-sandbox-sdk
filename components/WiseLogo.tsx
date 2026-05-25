'use client';

import { useState } from 'react';

interface WiseLogoProps {
  size?: number;
}

export function WiseLogo({ size = 28 }: WiseLogoProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <img
        src="https://logo.clearbit.com/wise.com"
        height={size}
        alt="Wise"
        style={{ 
          objectFit: 'contain', 
          display: hasError ? 'none' : 'block' 
        }}
        onError={() => setHasError(true)}
      />
      <span
        style={{
          display: hasError ? 'inline-block' : 'none',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 800,
          fontSize: '18px',
          color: '#163300',
          background: '#9FE870',
          padding: '3px 10px',
          borderRadius: '6px',
          letterSpacing: '-0.02em'
        }}
      >
        Wise
      </span>
    </div>
  );
}
