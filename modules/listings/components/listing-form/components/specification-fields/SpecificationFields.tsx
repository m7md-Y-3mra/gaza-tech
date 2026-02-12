'use client';

import TextField from '@/components/text-field';
import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';

interface SpecificationFieldsProps {
  disabled?: boolean;
}

const SpecificationFields: React.FC<SpecificationFieldsProps> = ({
  disabled = false,
}) => {
  const { control } = useFormContext();
  const t = useTranslations('ListingForm.specifications');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specifications',
  });

  const addCustomSpecification = () => {
    append({
      label: '',
      value: '',
      isCustom: true,
    });
  };

  const handleRemoveCustom = (index: number) => {
    remove(index);
  };

  return (
    <div className="space-y-4">
      {/* Predefined Specifications */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field, index) => {
          // Check if this is a predefined or custom specification
          const isCustom = (field as { isCustom?: boolean }).isCustom;

          if (isCustom) return null; // Render custom specs in separate section

          // Get the specification key from the field
          const specKey = (field as { label?: string }).label || '';

          const displayLabel = specKey ? t(specKey) : specKey;
          const displayPlaceholder = specKey
            ? t(`${specKey}Placeholder`)
            : 'Specification Placeholder';

          return (
            <TextField
              key={field.id}
              name={`specifications.${index}.value`}
              label={displayLabel}
              placeholder={displayPlaceholder}
              disabled={disabled}
            />
          );
        })}
      </div>

      {/* Custom Specifications */}
      <div className="space-y-4">
        {fields.map((field, index) => {
          const isCustom = (field as { isCustom?: boolean }).isCustom;
          if (!isCustom) return null;

          return (
            <div key={field.id} className="flex items-start gap-3">
              <div className="flex-1">
                <TextField
                  name={`specifications.${index}.label`}
                  label={t('customSpecName')}
                  placeholder={t('customSpecName')}
                  disabled={disabled}
                />
              </div>
              <div className="flex-1">
                <TextField
                  name={`specifications.${index}.value`}
                  label={t('customSpecValue')}
                  placeholder={t('customSpecValue')}
                  disabled={disabled}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => handleRemoveCustom(index)}
                disabled={disabled}
                className="shrink-0 self-center"
                aria-label={t('removeSpec')}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Add Custom Specification Button */}
      <Button
        type="button"
        variant="outline"
        onClick={addCustomSpecification}
        disabled={disabled}
        className="w-full"
      >
        <Plus className="me-2 h-4 w-4" />
        {t('addCustomSpec')}
      </Button>
    </div>
  );
};

export default SpecificationFields;
