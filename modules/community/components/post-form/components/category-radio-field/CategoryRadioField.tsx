'use client';

import { useFormContext, Controller, get } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import {
  HelpCircle,
  Lightbulb,
  Newspaper,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import { POST_CATEGORIES, PostCategory } from '@/modules/community/types';
import { useTranslations } from 'next-intl';

type CategoryRadioFieldProps = {
  name: string;
  label?: string;
};

const CATEGORY_ICONS: Record<PostCategory, React.ElementType> = {
  questions: HelpCircle,
  tips: Lightbulb,
  news: Newspaper,
  troubleshooting: Wrench,
};

export const CategoryRadioField = ({
  name,
  label,
}: CategoryRadioFieldProps) => {
  const {
    control,
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();
  const t = useTranslations('PostForm');

  const error = get(errors, name);
  const touched = get(touchedFields, name);
  const hasError = (isSubmitted || touched) && !!error;

  return (
    <div className="space-y-3">
      {label && <Label className="text-sm font-semibold">{label}</Label>}
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ref } }) => (
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            role="radiogroup"
          >
            {(Object.keys(POST_CATEGORIES) as PostCategory[]).map(
              (category) => {
                const Icon = CATEGORY_ICONS[category];
                const isSelected = value === category;

                return (
                  <label
                    key={category}
                    className={`hover:bg-muted/50 focus-within:ring-primary flex cursor-pointer items-center space-x-3 rounded-xl border-2 p-4 transition-all focus-within:ring-2 focus-within:ring-offset-2 ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : hasError
                          ? 'border-destructive'
                          : 'border-border'
                    } `}
                  >
                    <input
                      type="radio"
                      name={name}
                      value={category}
                      checked={isSelected}
                      onChange={(e) => onChange(e.target.value)}
                      ref={ref}
                      className="sr-only"
                    />
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} `}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {t(`categories.${category}.title`)}
                      </p>
                      <p className="text-muted-foreground line-clamp-1 text-xs">
                        {t(`categories.${category}.description`)}
                      </p>
                    </div>
                  </label>
                );
              }
            )}
          </div>
        )}
      />
      {hasError && (
        <p className="text-destructive mt-1.5 flex items-center gap-1 text-sm">
          <AlertCircle className="h-3.5 w-3.5" />
          {error?.message as string}
        </p>
      )}
    </div>
  );
};
