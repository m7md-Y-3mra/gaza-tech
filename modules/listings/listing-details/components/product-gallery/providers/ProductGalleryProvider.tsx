'use client';

import {
  createContext,
  ReactNode,
  useState,
  useMemo,
  useCallback,
  useContext,
} from 'react';

// Context Type
export interface ProductGalleryContextValue {
  selectedImageIndex: number;
  isLightboxOpen: boolean;
  setSelectedImageIndex: (index: number) => void;
  handleThumbnailClick: (index: number) => void;
  openLightbox: () => void;
  closeLightbox: () => void;
}

// Create Context
const ProductGalleryContext = createContext<
  ProductGalleryContextValue | undefined
>(undefined);

ProductGalleryContext.displayName = 'ProductGalleryContext';

// Provider Props
export interface ProductGalleryProviderProps {
  children: ReactNode;
}

// Provider Component
export function ProductGalleryProvider({
  children,
}: ProductGalleryProviderProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Memoize handlers to prevent re-creation
  const handleThumbnailClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const openLightbox = useCallback(() => setIsLightboxOpen(true), []);
  const closeLightbox = useCallback(() => setIsLightboxOpen(false), []);

  // Memoize the entire context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      selectedImageIndex,
      isLightboxOpen,
      setSelectedImageIndex,
      handleThumbnailClick,
      openLightbox,
      closeLightbox,
    }),
    [
      selectedImageIndex,
      isLightboxOpen,
      handleThumbnailClick,
      openLightbox,
      closeLightbox,
    ]
  );

  return (
    <ProductGalleryContext.Provider value={value}>
      {children}
    </ProductGalleryContext.Provider>
  );
}

// Custom Hook
export function useProductGallery() {
  const context = useContext(ProductGalleryContext);

  if (!context) {
    throw new Error(
      'useProductGallery must be used within a ProductGalleryProvider'
    );
  }

  return context;
}
