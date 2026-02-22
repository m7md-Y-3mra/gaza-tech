import { authHandler } from '@/utils/auth-handler';
import VerificationFormClient from './VerificationFormClient';

const VerificationForm = async () => {
  const user = await authHandler();
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
              Seller Verification
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete the steps below to get your seller badge and build trust
              with buyers.
            </p>
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
