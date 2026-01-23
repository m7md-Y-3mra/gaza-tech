'use client';

import { AlertCircle } from 'lucide-react';

const SellerInfoError = () => {
  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="text-muted-foreground flex items-center gap-2">
        <AlertCircle className="size-5" />
        <p className="text-sm">Unable to load seller information</p>
      </div>
    </div>
  );
};

export default SellerInfoError;
