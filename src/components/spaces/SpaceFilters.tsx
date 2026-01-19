import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Input, Select } from '@/components/ui';
import { usePlaces } from '@/hooks';

interface SpaceFiltersProps {
  placeId: string;
  isActive: string;
  searchQuery: string;
  onPlaceChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export function SpaceFilters({
  placeId,
  isActive,
  searchQuery,
  onPlaceChange,
  onStatusChange,
  onSearchChange,
}: SpaceFiltersProps) {
  const { placesOptions } = usePlaces();

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Available' },
    { value: 'false', label: 'Unavailable' },
  ];

  const allPlacesOptions = [
    { value: '', label: 'All Locations' },
    ...placesOptions,
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
      <div className="flex-1">
        <Input
          placeholder="Search spaces..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
        />
      </div>
      
      <div className="flex gap-3">
        <div className="w-48">
          <Select
            options={allPlacesOptions}
            value={placeId}
            onChange={(e) => onPlaceChange(e.target.value)}
          />
        </div>
        
        <div className="w-40">
          <Select
            options={statusOptions}
            value={isActive}
            onChange={(e) => onStatusChange(e.target.value)}
          />
        </div>

        <button className="p-2.5 rounded-xl border border-surface-200 text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors">
          <FunnelIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
