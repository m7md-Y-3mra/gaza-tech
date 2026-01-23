import { useState } from 'react';
import { UseProductGalleryProps } from '../types';

export const useProductGallery = ({ title, productCondition }: UseProductGalleryProps) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const handleShare = async () => {
        const shareData = {
            title: title,
            text: `Check out this listing: ${title}`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                // TODO: Show toast notification in Stage 15
                console.log('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleBookmark = () => {
        // TODO: Integrate with Supabase bookmarked_listings in Stage 15
        setIsBookmarked(!isBookmarked);
        console.log('Bookmark toggled');
    };

    const handleThumbnailClick = (index: number) => {
        setSelectedImageIndex(index);
    };

    // Check if product is "new" based on condition
    const isNew = ['new', 'like new', 'brand new', 'good'].includes(
        productCondition.toLowerCase()
    );

    return {
        selectedImageIndex,
        isBookmarked,
        isNew,
        handleShare,
        handleBookmark,
        handleThumbnailClick,
    };
};
