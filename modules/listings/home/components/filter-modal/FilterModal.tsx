'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FilterModalProps } from './types';
import { ProductCondition } from '@/modules/listings/types';

const FilterModal = ({ isOpen, onClose }: FilterModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div
        className={cn(
          'bg-background fixed inset-y-0 left-0 z-50 w-full max-w-xs shadow-xl transition-transform duration-300 sm:max-w-sm',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-5" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Price Range */}
            <div className="mb-6 space-y-4">
              <h3 className="font-medium">Price Range</h3>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="Min" className="h-9" />
                <span className="text-muted-foreground">-</span>
                <Input type="number" placeholder="Max" className="h-9" />
              </div>
            </div>

            {/* Condition */}
            <div className="mb-6 space-y-4">
              <h3 className="font-medium">Condition</h3>
              <div className="space-y-2">
                {Object.values(ProductCondition).map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox id={`condition-${condition}`} />
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
                <div className="flex items-center space-x-2">
                  <Checkbox id="loc-gaza" />
                  <Label htmlFor="loc-gaza" className="font-normal">
                    Gaza City
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="loc-khan" />
                  <Label htmlFor="loc-khan" className="font-normal">
                    Khan Younis
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="loc-rafah" />
                  <Label htmlFor="loc-rafah" className="font-normal">
                    Rafah
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="loc-north" />
                  <Label htmlFor="loc-north" className="font-normal">
                    North Gaza
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t p-6">
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Reset
              </Button>
              <Button className="flex-1" onClick={onClose}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
