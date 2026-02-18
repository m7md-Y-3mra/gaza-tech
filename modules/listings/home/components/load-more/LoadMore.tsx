'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { getListingsAction } from '@/modules/listings/actions';
import { ListingCardItem, ListingsFilters } from '@/modules/listings/queries';
import { ListingCardSkeleton } from '../listing-card';
import ListingsGrid from '../listings-grid';
import {
  DEFAULT_LIMIT_NUMBER,
  DEFAULT_PAGE_NUMBER,
} from '@/constants/pagination';

type LoadMoreProps = {
  filters: ListingsFilters;
};

const LoadMore = ({ filters }: LoadMoreProps) => {
  const [listings, setListings] = useState<ListingCardItem[]>([]);
  const page = useRef(DEFAULT_PAGE_NUMBER);
  const [showSpinner, setShowSpinner] = useState(true);
  const [error, setError] = useState(false);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      const loadMoreListings = async () => {
        const nextPage = page.current + 1;
        const newListingsRes = await getListingsAction({
          filters,
          page: nextPage,
        });
        if (!newListingsRes.success) {
          setError(true);
          setShowSpinner(false);
          return;
        }
        const newListings = newListingsRes.data.data;
        if (newListings.length < 1) {
          setShowSpinner(false);
          return;
        }
        setListings((prevListings: ListingCardItem[]) => [
          ...prevListings,
          ...newListings,
        ]);
        if (newListings.length < DEFAULT_LIMIT_NUMBER) {
          setShowSpinner(false);
        }
        page.current = nextPage;
      };

      loadMoreListings();
    }
  }, [inView, filters]);

  return (
    <>
      <ListingsGrid listings={listings} />

      {error && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground text-sm">
            Failed to load more listings. Please try again later.
          </p>
        </div>
      )}

      {showSpinner && (
        <div
          ref={ref}
          className="col-span-1 mt-6 grid grid-cols-1 gap-6 sm:col-span-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      )}
    </>
  );
};

export default LoadMore;
