'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';

type FilterOpenContextType = {
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  openFilter: () => void;
  closeFilter: () => void;
  toggleFilter: () => void;
};

const FilterOpenContext = createContext<FilterOpenContextType | undefined>(
  undefined
);

export const FilterOpenProvider = ({ children }: { children: ReactNode }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const openFilter = useCallback(() => setIsFilterOpen(true), []);
  const closeFilter = useCallback(() => setIsFilterOpen(false), []);
  const toggleFilter = useCallback(() => setIsFilterOpen((prev) => !prev), []);

  return (
    <FilterOpenContext.Provider
      value={{
        isFilterOpen,
        setIsFilterOpen,
        openFilter,
        closeFilter,
        toggleFilter,
      }}
    >
      {children}
    </FilterOpenContext.Provider>
  );
};

export const useFilterOpen = () => {
  const context = useContext(FilterOpenContext);
  if (context === undefined) {
    throw new Error('useFilterOpen must be used within a FilterOpenProvider');
  }
  return context;
};
