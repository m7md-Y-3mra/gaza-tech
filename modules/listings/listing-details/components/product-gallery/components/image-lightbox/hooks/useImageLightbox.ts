import { useEffect, useCallback } from 'react';
import { ImageLightboxProps } from '../types';

type UseImageLightboxProps = Pick<ImageLightboxProps, 'isOpen' | 'onClose' | 'onIndexChange' | 'initialIndex' | 'images'>;

export const useImageLightbox = ({
    images,
    initialIndex,
    isOpen,
    onClose,
    onIndexChange,
}: UseImageLightboxProps) => {
    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    onIndexChange((initialIndex - 1 + images.length) % images.length);
                    break;
                case 'ArrowRight':
                    onIndexChange((initialIndex + 1) % images.length);
                    break;
            }
        },
        [isOpen, onClose, onIndexChange, initialIndex, images.length]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        // Prevent scrolling when lightbox is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [handleKeyDown, isOpen]);

    const handlePrevious = () => {
        onIndexChange((initialIndex - 1 + images.length) % images.length);
    };

    const handleNext = () => {
        onIndexChange((initialIndex + 1) % images.length);
    };

    return {
        handlePrevious,
        handleNext,
    };
};
