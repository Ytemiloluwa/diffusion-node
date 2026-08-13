'use client';

import type { HTMLAttributes } from 'react';
import { useId } from 'react';
import { cn } from '@/lib/cn';

type AppLogoSize = 'lg' | 'md' | 'sm';

const sizeClasses: Record<AppLogoSize, string> = {
  lg: 'size-14',
  md: 'size-11',
  sm: 'size-9',
};

export type AppLogoProps = HTMLAttributes<HTMLSpanElement> & {
  size?: AppLogoSize;
};

export function AppLogo({ className, size = 'md', ...props }: AppLogoProps) {
  const id = useId().replace(/:/g, '');
  const accentId = `${id}-accent`;
  const glowId = `${id}-glow`;
  const panelId = `${id}-panel`;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-panel shadow-panel',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <svg
        aria-hidden="true"
        className="size-full"
        fill="none"
        viewBox="0 0 256 256"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={panelId}
            x1="48"
            x2="221"
            y1="31"
            y2="226"
          >
            <stop stopColor="#031826" />
            <stop offset="0.55" stopColor="#07111F" />
            <stop offset="1" stopColor="#020617" />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={accentId}
            x1="35"
            x2="221"
            y1="201"
            y2="201"
          >
            <stop stopColor="#06B6D4" />
            <stop offset="0.5" stopColor="#14B8A6" />
            <stop offset="1" stopColor="#22C55E" />
          </linearGradient>
          <filter
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
            id={glowId}
            x="24"
            y="36"
            width="208"
            height="178"
          >
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect x="24" y="24" width="208" height="208" rx="48" fill={`url(#${panelId})`} />
        <path
          d="M24 180H232V190C232 213.196 213.196 232 190 232H66C42.804 232 24 213.196 24 190V180Z"
          fill={`url(#${accentId})`}
        />
        <path
          d="M56 180H200"
          opacity="0.55"
          stroke="#67E8F9"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <g filter={`url(#${glowId})`}>
          <path d="M128 72V122" stroke="#D1FAE5" strokeLinecap="round" strokeWidth="10" />
          <path
            d="M82 144L128 122L174 144"
            stroke="#E2E8F0"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="10"
          />
          <path
            d="M89 98L128 72L167 98"
            stroke="#F8FAFC"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="10"
          />
          <circle cx="128" cy="72" r="12" fill="#F8FAFC" />
          <circle cx="82" cy="144" r="12" fill="#14B8A6" />
          <circle cx="174" cy="144" r="12" fill="#22C55E" />
          <circle cx="128" cy="122" r="10" fill="#06B6D4" />
        </g>
        <path
          d="M72 168C92 188 164 188 184 168"
          opacity="0.7"
          stroke="#94A3B8"
          strokeLinecap="round"
          strokeWidth="6"
        />
      </svg>
    </span>
  );
}
