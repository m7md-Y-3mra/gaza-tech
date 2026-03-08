'use client';

import { useTranslations } from 'next-intl';
import { Shield, UserCheck, Lock } from 'lucide-react';

const TrustBadges = () => {
  const t = useTranslations('Auth.trustBadges');

  return (
    <div className="border-border mt-10 border-t pt-8">
      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <Shield className="text-primary mx-auto mb-2 h-6 w-6" />
          <p className="text-muted-foreground text-xs font-medium">
            {t('secureLogin')}
          </p>
        </div>
        <div className="text-center">
          <Lock className="text-primary mx-auto mb-2 h-6 w-6" />
          <p className="text-muted-foreground text-xs font-medium">
            {t('ssl')}
          </p>
        </div>
        <div className="text-center">
          <UserCheck className="text-primary mx-auto mb-2 h-6 w-6" />
          <p className="text-muted-foreground text-xs font-medium">
            {t('privacyProtected')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
