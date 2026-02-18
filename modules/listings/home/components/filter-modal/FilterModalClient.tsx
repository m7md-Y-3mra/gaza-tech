'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FilterModalClientProps } from './types';
import { Currency, ProductCondition } from '@/modules/listings/types';
import { useFilterOpen } from '../../providers/FilterOpenProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQueryState } from 'nuqs';
import { listingsSearchParams } from '../../search-params';

const queryOptions = { shallow: false } as const;

const FilterModalClient = ({ locations }: FilterModalClientProps) => {
  const { isFilterOpen, closeFilter } = useFilterOpen();

  const [minPrice, setMinPrice] = useQueryState(
    'minPrice',
    listingsSearchParams.minPrice.withOptions(queryOptions)
  );
  const [maxPrice, setMaxPrice] = useQueryState(
    'maxPrice',
    listingsSearchParams.maxPrice.withOptions(queryOptions)
  );
  const [currency, setCurrency] = useQueryState(
    'currency',
    listingsSearchParams.currency.withOptions(queryOptions)
  );
  const [selectedConditions, setSelectedConditions] = useQueryState(
    'conditions',
    listingsSearchParams.conditions.withOptions(queryOptions)
  );
  const [selectedLocations, setSelectedLocations] = useQueryState(
    'locations',
    listingsSearchParams.locations.withOptions(queryOptions)
  );

  const handleConditionChange = (
    checked: boolean | 'indeterminate',
    condition: string
  ) => {
    const current = selectedConditions || [];
    if (checked === true) {
      setSelectedConditions([...current, condition]);
    } else {
      const next = current.filter((c) => c !== condition);
      setSelectedConditions(next.length > 0 ? next : null);
    }
  };

  const handleLocationChange = (
    checked: boolean | 'indeterminate',
    locationId: string
  ) => {
    const current = selectedLocations || [];
    if (checked === true) {
      setSelectedLocations([...current, locationId]);
    } else {
      const next = current.filter((id) => id !== locationId);
      setSelectedLocations(next.length > 0 ? next : null);
    }
  };

  const handleReset = () => {
    setMinPrice(null);
    setMaxPrice(null);
    setCurrency(null);
    setSelectedConditions(null);
    setSelectedLocations(null);
    closeFilter();
  };

  if (!isFilterOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 transition-opacity duration-300',
          isFilterOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={closeFilter}
      />

      {/* Slide-over Panel */}
      <div
        className={cn(
          'bg-background fixed inset-y-0 left-0 z-50 w-full max-w-xs shadow-xl transition-transform duration-300 sm:max-w-sm',
          isFilterOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button variant="ghost" size="icon" onClick={closeFilter}>
              <X className="size-5" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Price Range */}
            <div className="mb-6 space-y-4">
              <h3 className="font-medium">Price Range</h3>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  name="min"
                  placeholder="Min"
                  className="h-9"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  name="max"
                  placeholder="Max"
                  className="h-9"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
                <span className="text-muted-foreground">-</span>
                <Select
                  value={currency}
                  onValueChange={(value) =>
                    setCurrency(value as typeof currency)
                  }
                >
                  <SelectTrigger className="bg-background hover:border-primary h-10! rounded-lg border-2 sm:w-[180px]">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Currency).map((cur) => (
                      <SelectItem key={cur} value={cur}>
                        {cur}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Condition */}
            <div className="mb-6 space-y-4">
              <h3 className="font-medium">Condition</h3>
              <div className="space-y-2">
                {Object.entries(ProductCondition).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`condition-${key}`}
                      checked={(selectedConditions || []).includes(key)}
                      onCheckedChange={(checked) =>
                        handleConditionChange(checked, key)
                      }
                    />
                    <Label htmlFor={`condition-${key}`} className="font-normal">
                      {value}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="mb-6 space-y-4">
              <h3 className="font-medium">Location</h3>
              <div className="space-y-2">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={location.id}
                      checked={(selectedLocations || []).includes(location.id)}
                      onCheckedChange={(checked) =>
                        handleLocationChange(checked, location.id)
                      }
                    />
                    <Label htmlFor={location.id} className="font-normal">
                      {location.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t p-6">
            <Button variant="outline" className="w-full" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModalClient;
