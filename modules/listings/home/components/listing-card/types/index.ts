// Mock type for the card props
export interface ListingCardProps {
    id: string;
    title: string;
    price: number;
    currency: string;
    image: string;
    location: string;
    condition: 'New' | 'Used';
    sellerName: string;
    isVerified: boolean;
}
