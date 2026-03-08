export type SellerInfoProps = {
  sellerId: string;
};

export type SellerData = {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  listingsCount: number;
};
