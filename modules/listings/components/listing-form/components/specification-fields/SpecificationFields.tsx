'use client';
import TextField from '@/components/text-field';
import { Label } from '@/components/ui/label';
import { specifications as specificationLabels } from '@/modules/listings/types';
import type { SpecificationFieldsProps } from './types';
import { specificationPlaceholders } from './constant';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Specification fields component
 * Renders all specification inputs for listing form
 * Uses useFieldArray to maintain the array shape {label, value, isCustom}[]
 */
const SpecificationFields: React.FC<SpecificationFieldsProps> = ({
  disabled = false,
}) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specifications',
  });

  const handleAddCustom = () => {
    append({ label: '', value: '', isCustom: true });
  };

  const handleRemoveCustom = (index: number) => {
    remove(index);
  };

  return (
    <div>
      <Label className="mb-4 block text-sm font-semibold">
        Product Specifications
      </Label>
      <p className="text-muted-foreground mb-4 text-sm">
        Fill in the relevant specifications for your product. These help buyers
        make informed decisions.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field, index) => {
          const specKey = (field as unknown as { label: string }).label;
          const isCustom = (field as unknown as { isCustom: boolean }).isCustom;

          if (isCustom) {
            return (
              <div
                key={field.id}
                className="col-span-1 flex items-start gap-2 md:col-span-2"
              >
                <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                  <TextField
                    name={`specifications.${index}.label`}
                    label="Specification Name"
                    placeholder="e.g., Color, Weight, Ports"
                    disabled={disabled}
                  />
                  <TextField
                    name={`specifications.${index}.value`}
                    label="Value"
                    placeholder="e.g., Black, 1.5kg, 3x USB-C"
                    disabled={disabled}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCustom(index)}
                  disabled={disabled}
                  className="text-muted-foreground hover:text-destructive mt-8 shrink-0 cursor-pointer transition-colors"
                  aria-label="Remove custom specification"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            );
          }

          const displayLabel =
            specificationLabels[specKey as keyof typeof specificationLabels] ??
            specKey;

          return (
            <TextField
              key={field.id}
              name={`specifications.${index}.value`}
              label={displayLabel}
              placeholder={
                specificationPlaceholders[
                  specKey as keyof typeof specificationPlaceholders
                ] ?? ''
              }
              disabled={disabled}
            />
          );
        })}
      </div>

      {/* Add Custom Specification Button */}
      <Button
        type="button"
        variant="ghost"
        onClick={handleAddCustom}
        disabled={disabled}
        className="text-primary hover:text-primary/80 mt-4 cursor-pointer gap-1.5 px-0 hover:bg-transparent"
      >
        <Plus className="h-4 w-4" />
        Add Custom Specification
      </Button>
    </div>
  );
};

export default SpecificationFields;
