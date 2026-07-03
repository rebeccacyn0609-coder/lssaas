import React, { useMemo, useState } from 'react';

import type { ModelPricingItem } from '../../untitled/components/mockData';
import { getModelVendorTypeLabel } from './mockData';
import { getVendorAccentClass } from './vendorAccent';
import {
  getVendorIconCandidates,
  VENDOR_ICON_DEFAULT_URL,
} from './vendorIconSources';

type VendorLogoProps = {
  vendorType: ModelPricingItem['vendorType'];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
};

export function VendorLogo({
  vendorType,
  size = 'md',
  className = '',
  showLabel = false,
}: VendorLogoProps) {
  const accentClass = getVendorAccentClass(vendorType);
  const label = getModelVendorTypeLabel(vendorType);
  const candidates = useMemo(() => getVendorIconCandidates(vendorType), [vendorType]);
  const [candidateIndex, setCandidateIndex] = useState(0);

  const src = candidates[Math.min(candidateIndex, candidates.length - 1)] ?? VENDOR_ICON_DEFAULT_URL;

  const handleError = () => {
    setCandidateIndex((current) => {
      if (current >= candidates.length - 1) return current;
      return current + 1;
    });
  };

  return (
    <span
      className={`vendor-logo vendor-logo--${size} ${accentClass} ${className}`.trim()}
      title={label}
      aria-label={label}
    >
      <img
        src={src}
        alt={`${label} logo`}
        className="vendor-logo-image"
        draggable={false}
        onError={handleError}
      />
      {showLabel ? <span className="vendor-logo-label">{label}</span> : null}
    </span>
  );
}

export function getVendorLogoSrc(vendorType: ModelPricingItem['vendorType']): string {
  return getVendorIconCandidates(vendorType)[0] ?? VENDOR_ICON_DEFAULT_URL;
}
