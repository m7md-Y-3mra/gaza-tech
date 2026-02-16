'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { getListingsAction } from '@/modules/listings/actions';
import { ListingCardItem } from '@/modules/listings/queries';
import { ListingCardSkeleton } from '../listing-card';
import ListingsGrid from '../listings-grid';
import {
  DEFAULT_LIMIT_NUMBER,
  DEFAULT_PAGE_NUMBER,
} from '@/constants/pagination';

const LoadMore = () => {
  const [listings, setListings] = useState<ListingCardItem[]>([]);
  const page = useRef(DEFAULT_PAGE_NUMBER);
  const [showSpinner, setShowSpinner] = useState(true);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      const loadMoreListings = async () => {
        const nextPage = page.current + 1;
        const newListingsRes = await getListingsAction({
          filters: {},
          page: nextPage,
        });
        if (!newListingsRes.success) {
          throw Error('');
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
  }, [inView]);

  return (
    <>
      <ListingsGrid listings={listings} />
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
