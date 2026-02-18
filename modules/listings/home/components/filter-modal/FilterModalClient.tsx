'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FilterModalClientProps } from './types';
import {
  Currency,
  CurrencyType,
  ProductCondition,
} from '@/modules/listings/types';
import { useFilterOpen } from '../../providers/FilterOpenProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, ChangeEvent } from 'react';
import { serializeListingsSearchParams } from '../../search-params';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

const FilterModalClient = ({
  locations,
  searchParams,
}: FilterModalClientProps) => {
  const { isFilterOpen, closeFilter } = useFilterOpen();
  const [price, setPrice] = useState<{
    min: number;
    max: number;
    currency: CurrencyType;
  }>({
    min: searchParams?.minPrice,
    max: searchParams?.maxPrice,
    currency: searchParams?.currency,
  });
  const router = useRouter();
  const pathname = usePathname();
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    searchParams.conditions
  );

  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    searchParams.locations
  );

  const handlePriceChange = (
    e: ChangeEvent<HTMLInputElement> | { name: string; value: string | number }
  ) => {
    const { name, value } = 'target' in e ? e.target : e;
    setPrice((prev) => ({
      ...prev,
      [name]: name === 'currency' ? value : Number(value),
    }));
  };

  const handleConditionChange = (
    checked: boolean | 'indeterminate',
    condition: string
  ) => {
    setSelectedConditions((prev) =>
      checked === true
        ? [...prev, condition]
        : prev.filter((c) => c !== condition)
    );
  };

  const handleLocationChange = (
    checked: boolean | 'indeterminate',
    locationId: string
  ) => {
    setSelectedLocations((prev) =>
      checked === true
        ? [...prev, locationId]
        : prev.filter((id) => id !== locationId)
    );
  };

  const handleApply = () => {
    const url = serializeListingsSearchParams({
      conditions: selectedConditions,
      locations: selectedLocations,
      minPrice: price.min,
      maxPrice: price.max,
      currency: price.currency,
    });
    closeFilter();
    router.push(url);
  };

  const handleReset = () => {
    const url = serializeListingsSearchParams(pathname, {
      conditions: null,
      locations: null,
      minPrice: null,
      maxPrice: null,
      currency: null,
    });
    console.log({ url, pathname });
    closeFilter();
    router.push(pathname);
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
                  value={price.min}
                  onChange={handlePriceChange}
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  name="max"
                  placeholder="Max"
                  className="h-9"
                  value={price.max}
                  onChange={handlePriceChange}
                />
                <span className="text-muted-foreground">-</span>
                <Select
                  value={price.currency}
                  onValueChange={(value) =>
                    handlePriceChange({ name: 'currency', value })
                  }
                >
                  <SelectTrigger className="bg-background hover:border-primary h-10! rounded-lg border-2 sm:w-[180px]">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Currency).map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
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
                {Object.values(ProductCondition).map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={`condition-${condition}`}
                      checked={selectedConditions.includes(condition)}
                      onCheckedChange={(checked) =>
                        handleConditionChange(checked, condition)
                      }
                    />
                    <Label
                      htmlFor={`condition-${condition}`}
                      className="font-normal"
                    >
                      {condition}
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
                      checked={selectedLocations.includes(location.id)}
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
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button className="flex-1" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModalClient;
