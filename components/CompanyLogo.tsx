'use client';

import { useState } from 'react';

interface CompanyLogoProps {
  src: string;
  alt: string;
  className?: string;
}

export default function CompanyLogo({ src, alt, className }: CompanyLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className={`bg-gray-700 rounded-full flex items-center justify-center text-white font-bold ${className || 'w-12 h-12'}`}>
        {alt?.charAt(0)?.toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className || 'w-12 h-12 rounded-full object-contain bg-white'}
      onError={() => setHasError(true)}
    />
  );
}
