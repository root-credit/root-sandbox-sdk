'use client';

import { useState } from 'react';
import { branding } from '@/lib/branding';

interface WiseLogoProps {
  size?: number;
  className?: string;
}

export function WiseLogo({ size = 28, className = '' }: WiseLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span className={`text-lg font-semibold text-[#9FE870] ${className}`}>
        {branding.productName}
      </span>
    );
  }

  return (
    <img
      src="https://logo.clearbit.com/wise.com"
      height={size}
      width={size}
      alt="Wise"
      onError={() => setHasError(true)}
      className={`h-${size === 24 ? '6' : '7'} w-auto ${className}`}
    />
  );
}
