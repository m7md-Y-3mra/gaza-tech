'use client';
import { FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import TextField from '@/components/text-field';
import SelectField from '@/components/select-field';
import ImageUpload from './components/image-upload';
import SpecificationFields from './components/specification-fields';
import LivePreview from './components/live-preview';
import { useListingForm } from './hooks/useListingForm';
import type { ListingFormClientProps } from './types';
import { currencyOptions, getProductConditionOptions } from './constant';
import LoadingSubmittingSpinner from '@/components/loading-submitting-spinner';
import CategorySelectField from './components/category-select-field';
import { useTranslations } from 'next-intl';

/**
 * Reusable listing form component
 * Supports both create and update modes
 */
const ListingFormClient: React.FC<ListingFormClientProps> = (props) => {
  const { mode, groupedCategories, locations } = props;
  const listingId = mode === 'update' ? props.listingId : undefined;
  const initialData = mode === 'update' ? props.initialData : undefined;
  const t = useTranslations('ListingForm');

  const { form, isSubmitting, submitError, onSubmit, handleCancel, isPending } =
    useListingForm(mode, listingId, initialData);

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Form Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Images Section - FIRST */}
            <div className="border-border bg-card rounded-2xl p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-foreground mb-2 text-2xl font-bold">
                  {t('images.title')}
                </h2>
                <p className="text-muted-foreground">{t('images.subtitle')}</p>
              </div>

              {mode == 'create' ? (
                <ImageUpload
                  mode="create"
                  name="images"
                  disabled={isSubmitting}
                />
              ) : (
                <ImageUpload
                  mode="update"
                  name="images"
                  disabled={isSubmitting}
                  initialImages={initialData?.images || []}
                />
              )}

              {/* Tips Box */}
              <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-lightbulb mt-0.5 text-lg text-blue-600"></i>
                  <div>
                    <h4 className="mb-1 font-semibold text-blue-900">
                      {t('images.tipsTitle')}
                    </h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• {t('images.tip1')}</li>
                      <li>• {t('images.tip2')}</li>
                      <li>• {t('images.tip3')}</li>
                      <li>• {t('images.tip4')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="border-border bg-card rounded-2xl p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-foreground mb-2 text-2xl font-bold">
                  {t('basicInfo.title')}
                </h2>
                <p className="text-muted-foreground">
                  {t('basicInfo.subtitle')}
                </p>
              </div>
              <div className="space-y-6">
                <TextField
                  name="title"
                  label={t('basicInfo.titleLabel')}
                  placeholder={t('basicInfo.titlePlaceholder')}
                  disabled={isSubmitting}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <CategorySelectField
                    name="category_id"
                    label={t('category.label')}
                    placeholder={t('category.placeholder')}
                    groupedCategories={groupedCategories}
                    disabled={isSubmitting}
                  />

                  <SelectField
                    name="product_condition"
                    label={t('condition.label')}
                    options={getProductConditionOptions(t)}
                    disabled={isSubmitting}
                  />
                </div>

                <TextField
                  name="description"
                  label={t('basicInfo.descriptionLabel')}
                  placeholder={t('basicInfo.descriptionPlaceholder')}
                  disabled={isSubmitting}
                  type="textarea"
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="border-border bg-card rounded-2xl p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-foreground mb-2 text-2xl font-bold">
                  {t('pricing.title')}
                </h2>
                <p className="text-muted-foreground">{t('pricing.subtitle')}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextField
                  name="price"
                  label={t('pricing.priceLabel')}
                  placeholder={t('pricing.pricePlaceholder')}
                  type="number"
                  valueAsNumber
                  disabled={isSubmitting}
                />

                <SelectField
                  name="currency"
                  label={t('pricing.currencyLabel')}
                  options={currencyOptions}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="border-border bg-card rounded-2xl p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-foreground mb-2 text-2xl font-bold">
                  {t('location.title')}
                </h2>
                <p className="text-muted-foreground">
                  {t('location.subtitle')}
                </p>
              </div>
              <SelectField
                name="location_id"
                label={t('location.label')}
                placeholder={t('location.placeholder')}
                options={locations}
                disabled={isSubmitting}
              />
            </div>

            {/* Specifications Section */}
            <div className="border-border bg-card rounded-2xl p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-foreground mb-2 text-2xl font-bold">
                  {t('specifications.title')}
                </h2>
                <p className="text-muted-foreground">
                  {t('specifications.subtitle')}
                </p>
              </div>
              <SpecificationFields disabled={isSubmitting} />
            </div>

            {/* Error Display */}
            {submitError && (
              <div className="border-destructive bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border-2 p-4">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">{submitError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || isPending}
                className="flex-1"
                size="lg"
              >
                {(isSubmitting || isPending) && <LoadingSubmittingSpinner />}
                {isPending
                  ? 'Redirecting...'
                  : isSubmitting
                    ? mode === 'create'
                      ? t('buttons.creating')
                      : t('buttons.updating')
                    : mode === 'create'
                      ? t('buttons.create')
                      : t('buttons.update')}
              </Button>

              {handleCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting || isPending}
                  size="lg"
                  className="hover:text-white"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Live Preview Sidebar */}
          <div className="lg:col-span-1">
            <LivePreview
              groupedCategories={groupedCategories}
              locations={locations}
            />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ListingFormClient;
