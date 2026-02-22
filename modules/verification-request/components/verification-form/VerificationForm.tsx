import { authHandler } from '@/utils/auth-handler';
import VerificationFormClient from './VerificationFormClient';
import { getTranslations } from 'next-intl/server';

const VerificationForm = async () => {
  const [user, t] = await Promise.all([
    authHandler(),
    getTranslations('VerificationForm'),
  ]);
  // Phone is verified when the auth user has both:
  //   • user.phone          — a phone number was linked via updateUser({ phone })
  //   • user.phone_confirmed_at — OTP was confirmed via verifyOtp({ type: 'phone_change' })
  const isPhoneVerified = Boolean(user?.phone && user?.phone_confirmed_at);
  const existingPhone = user?.phone ? '+' + user?.phone : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-green-50">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Page header */}
          <div className="mb-8 text-center">
            <h1 className="text-foreground text-3xl font-bold">
              {t('page.title')}
            </h1>
            <p className="text-muted-foreground mt-2">{t('page.subtitle')}</p>
          </div>

          <VerificationFormClient
            isPhoneVerified={isPhoneVerified}
            existingPhone={existingPhone}
          />
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;
