'use client';

import countries50m from 'world-atlas/countries-50m.json';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { useMemo, useState } from 'react';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import { cn } from '@/lib/cn';
import {
  normalizeCountryName,
  resolveAlpha2CountryCode,
} from '@/lib/countryCodes';

export type MapExposureMode = 'policies' | 'restrictions' | 'tier';

export type MapCountryDatum = {
  activePolicyCount: number;
  countryId: string;
  isoCode: string;
  name: string;
  policyCount: number;
  restrictionCount: number;
  tierClassification: string | null;
};

export type WorldExposureMapProps = {
  className?: string;
  countries: MapCountryDatum[];
  mode: MapExposureMode;
  onSelectCountry?: (countryId: string) => void;
  selectedCountryId?: string | null;
};

type AtlasProperties = {
  name?: string;
};

type AtlasFeature = Feature<Geometry, AtlasProperties> & {
  id?: string | number;
};

const MAP_WIDTH = 960;
const MAP_HEIGHT = 450;

const topology = countries50m as unknown as Topology<{
  countries: GeometryCollection<AtlasProperties>;
}>;

const atlasFeatures = feature(
  topology,
  topology.objects.countries,
) as FeatureCollection<Geometry, AtlasProperties>;

const countryFeatures = atlasFeatures.features as AtlasFeature[];

const projection = geoNaturalEarth1().fitSize([MAP_WIDTH, MAP_HEIGHT], atlasFeatures);
const pathGenerator = geoPath(projection);

const atlasCountryIds = new Set(countryFeatures.map((countryFeature) => String(countryFeature.id ?? '')));

const atlasIdsByCountryName = new Map<string, string>();

countryFeatures.forEach((countryFeature) => {
  const atlasId = String(countryFeature.id ?? '');
  const normalizedName = normalizeCountryName(countryFeature.properties.name);

  if (atlasId && normalizedName && !atlasIdsByCountryName.has(normalizedName)) {
    atlasIdsByCountryName.set(normalizedName, atlasId);
  }
});

const atlasNameAliases: Record<string, string> = {
  macau: 'macao',
  'macao sar china': 'macao',
  'united states': 'united states of america',
};

const atlasIdsByAlpha2CountryCode: Record<string, string> = {
  AE: '784',
  CA: '124',
  CN: '156',
  DE: '276',
  GB: '826',
  IN: '356',
  IR: '364',
  JP: '392',
  KG: '417',
  KR: '410',
  MO: '446',
  NL: '528',
  RU: '643',
  SG: '702',
  TR: '792',
  TW: '158',
  US: '840',
};

const exposureFillClasses = {
  base: 'fill-neutral-soft',
  high: 'fill-danger-line',
  low: 'fill-info-line',
  medium: 'fill-warning-line',
};

const tierFillClasses = {
  base: 'fill-neutral-soft',
  high: 'fill-danger-line',
  low: 'fill-info-line',
  medium: 'fill-warning-line',
};

const getAtlasId = (countryCode: string, countryName: string): string | null => {
  const normalizedCode = countryCode.trim().toUpperCase();

  if (/^\d{3}$/.test(normalizedCode) && atlasCountryIds.has(normalizedCode)) {
    return normalizedCode;
  }

  const normalizedName = normalizeCountryName(countryName);
  const atlasName = normalizedName ? (atlasNameAliases[normalizedName] ?? normalizedName) : null;
  const atlasIdByName = atlasName ? atlasIdsByCountryName.get(atlasName) : null;

  if (atlasIdByName) {
    return atlasIdByName;
  }

  const alpha2CountryCode = resolveAlpha2CountryCode(countryCode, countryName);

  return alpha2CountryCode ? (atlasIdsByAlpha2CountryCode[alpha2CountryCode] ?? null) : null;
};

const getExposureClass = (value: number): string => {
  if (value <= 0) {
    return exposureFillClasses.base;
  }

  if (value === 1) {
    return exposureFillClasses.low;
  }

  if (value <= 3) {
    return exposureFillClasses.medium;
  }

  return exposureFillClasses.high;
};

const getTierClass = (tierClassification: string | null): string => {
  if (!tierClassification) {
    return tierFillClasses.base;
  }

  if (tierClassification.includes('D:')) {
    return tierFillClasses.high;
  }

  if (tierClassification.includes('A:6')) {
    return tierFillClasses.medium;
  }

  return tierFillClasses.low;
};

const getCountryValue = (country: MapCountryDatum, mode: MapExposureMode): number | string | null => {
  if (mode === 'policies') {
    return country.activePolicyCount;
  }

  if (mode === 'restrictions') {
    return country.restrictionCount;
  }

  return country.tierClassification;
};

const getCountryFillClass = (country: MapCountryDatum | undefined, mode: MapExposureMode): string => {
  if (!country) {
    return exposureFillClasses.base;
  }

  if (mode === 'tier') {
    return getTierClass(country.tierClassification);
  }

  const value = mode === 'policies' ? country.activePolicyCount : country.restrictionCount;

  return getExposureClass(value);
};

const getCountryLabel = (country: MapCountryDatum, mode: MapExposureMode): string => {
  const value = getCountryValue(country, mode);

  if (mode === 'tier') {
    return `${country.name}: ${value ?? 'No tier'}`;
  }

  const unit = mode === 'policies' ? 'active policies' : 'restriction links';

  return `${country.name}: ${value} ${unit}`;
};

export function WorldExposureMap({
  className,
  countries,
  mode,
  onSelectCountry,
  selectedCountryId,
}: WorldExposureMapProps) {
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);
  const countriesByAtlasId = useMemo(() => {
    const exposureMap = new Map<string, MapCountryDatum>();

    countries.forEach((country) => {
      const atlasId = getAtlasId(country.isoCode, country.name);

      if (atlasId) {
        exposureMap.set(atlasId, country);
      }
    });

    return exposureMap;
  }, [countries]);

  const selectedCountry = countries.find((country) => country.countryId === selectedCountryId);
  const hoveredCountry = countries.find((country) => country.countryId === hoveredCountryId);
  const previewCountry = hoveredCountry ?? selectedCountry;

  return (
    <div className={cn('grid gap-4', className)}>
      <div className="overflow-hidden rounded-panel border border-line bg-surface-raised">
        <svg
          aria-label="World policy exposure map"
          className="block h-auto w-full"
          role="img"
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        >
          <rect className="fill-surface-raised" height={MAP_HEIGHT} width={MAP_WIDTH} />
          {countryFeatures.map((countryFeature, countryFeatureIndex) => {
            const atlasId = String(countryFeature.id ?? '');
            const country = countriesByAtlasId.get(atlasId);
            const isSelected = country?.countryId === selectedCountryId;
            const path = pathGenerator(countryFeature);
            const featureName = countryFeature.properties.name ?? 'Country';

            if (!path) {
              return null;
            }

            return (
              <path
                aria-label={country ? getCountryLabel(country, mode) : countryFeature.properties.name}
                className={cn(
                  'stroke-surface transition-colors duration-150',
                  getCountryFillClass(country, mode),
                  country
                    ? 'cursor-pointer hover:fill-brand hover:stroke-brand-hover focus:outline-none'
                    : 'opacity-70',
                  isSelected ? 'fill-brand stroke-brand-hover' : undefined,
                )}
                d={path}
                key={`${atlasId || 'unassigned'}-${featureName}-${countryFeatureIndex}`}
                onClick={() => {
                  if (country) {
                    onSelectCountry?.(country.countryId);
                  }
                }}
                onKeyDown={(event) => {
                  if (!country || (event.key !== 'Enter' && event.key !== ' ')) {
                    return;
                  }

                  event.preventDefault();
                  onSelectCountry?.(country.countryId);
                }}
                onMouseEnter={() => setHoveredCountryId(country?.countryId ?? null)}
                onMouseLeave={() => setHoveredCountryId(null)}
                role={country ? 'button' : undefined}
                strokeWidth={isSelected ? 1.2 : 0.6}
                tabIndex={country ? 0 : undefined}
              >
                <title>
                  {country ? getCountryLabel(country, mode) : featureName}
                </title>
              </path>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1 text-sm">
          <span className="font-semibold text-ink">
            {previewCountry ? previewCountry.name : 'No country selected'}
          </span>
          <span className="text-muted">
            {previewCountry
              ? `${previewCountry.activePolicyCount} active policies, ${previewCountry.restrictionCount} restriction links`
              : 'Global policy exposure view'}
          </span>
        </div>

        <div aria-label="Map legend" className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-[3px] bg-neutral-soft ring-1 ring-line" />
            None
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-[3px] bg-info-line ring-1 ring-line" />
            Low
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-[3px] bg-warning-line ring-1 ring-line" />
            Medium
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-[3px] bg-danger-line ring-1 ring-line" />
            High
          </span>
        </div>
      </div>
    </div>
  );
}
