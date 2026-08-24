import { Panel, Spinner } from '@/components/atoms';
import {
  WorldExposureMap,
  type MapCountryDatum,
  type MapExposureMode,
} from '@/components/organisms';
import { countryMapModeOptions } from '../constants';

type CountryMapPanelProps = {
  countries: MapCountryDatum[];
  isLoading: boolean;
  mapMode: MapExposureMode;
  onMapModeChange: (mode: MapExposureMode) => void;
  onSelectCountry: (countryId: string) => void;
  selectedCountryId: string | null;
};

export function CountryMapPanel({
  countries,
  isLoading,
  mapMode,
  onMapModeChange,
  onSelectCountry,
  selectedCountryId,
}: CountryMapPanelProps) {
  return (
    <Panel
      actions={
        <div className="inline-flex rounded-control border border-line-strong bg-surface p-0.5 shadow-control">
          {countryMapModeOptions.map((option) => {
            const isActive = option.value === mapMode;

            return (
              <button
                aria-pressed={isActive}
                className={`h-8 rounded-control px-3 text-xs font-semibold transition-colors ${
                  isActive ? 'bg-brand text-brand-contrast shadow-control' : 'text-muted hover:text-ink'
                }`}
                key={option.value}
                onClick={() => onMapModeChange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      }
      description="Countries are shaded by the selected exposure metric."
      title="World Exposure Map"
    >
      {isLoading ? (
        <div className="flex min-h-[22rem] items-center justify-center gap-3 text-sm text-muted">
          <Spinner label="Loading country map" />
          <span>Loading country map</span>
        </div>
      ) : (
        <WorldExposureMap
          countries={countries}
          mode={mapMode}
          onSelectCountry={onSelectCountry}
          selectedCountryId={selectedCountryId}
        />
      )}
    </Panel>
  );
}
