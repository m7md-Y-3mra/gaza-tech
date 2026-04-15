import { getTranslations } from 'next-intl/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCategoriesAction } from '../actions';
import { getLocationsAction } from '../actions';
import { CategoriesTable } from '../components/categories-table/CategoriesTable';
import { LocationsTable } from '../components/locations-table/LocationsTable';

export async function CategoryLocationPage() {
  const t = await getTranslations('CategoryLocation');

  const [categoriesResult, locationsResult] = await Promise.all([
    getCategoriesAction(),
    getLocationsAction(),
  ]);

  const categories = categoriesResult.success ? categoriesResult.data : [];
  const locations = locationsResult.success ? locationsResult.data : [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('pageTitle')}</h1>
        <p className="text-muted-foreground">{t('pageDescription')}</p>
      </div>

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">{t('categories_tab')}</TabsTrigger>
          <TabsTrigger value="locations">{t('locations_tab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-4">
          <CategoriesTable initialData={categories ?? []} />
        </TabsContent>

        <TabsContent value="locations" className="mt-4">
          <LocationsTable initialData={locations ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
