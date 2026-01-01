import Link from 'next/link';
import { ArrowLeft, Mail, Info, Check, AlertTriangle } from 'lucide-react';
import AuthLayout from '@/modules/auth/components/auth-layout/AuthLayout';
import TrustBadges from '@/modules/auth/components/trust-badges/TrustBadges';
import { OtpForm } from './components/otp-form';
import { VERIFICATION_TIPS } from './verifyEmailPage.constant';
import { VerifyEmailPageProps } from './types';
import { FC } from 'react';

const VerifyEmailPage: FC<VerifyEmailPageProps> = ({ email }) => {
  return (
    <AuthLayout variant="verify-email">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/login"
          className="group flex items-center space-x-2 text-gray-600 transition-colors duration-200 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="font-semibold">Back to Login</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-green-100 to-emerald-100 shadow-lg">
          <Mail className="text-primary h-10 w-10" />
        </div>
        <h2 className="text-foreground mb-3 text-3xl font-bold lg:text-4xl">
          Verify Your Email
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          We&apos;ve sent a 6-digit verification code to
        </p>
        <p className="text-primary mt-2 text-lg font-bold">{email}</p>
      </div>

      {/* Info Box */}
      <div className="mb-8 rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start space-x-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="mb-1 font-semibold text-blue-900">Check your inbox</p>
            <p className="text-sm text-blue-700">
              Please enter the code we sent to your email address. The code will
              expire in 10 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* OTP Form */}
      <OtpForm email={email} />

      {/* Verification Tips */}
      <div className="mt-8 space-y-3">
        <h3 className="text-foreground mb-3 text-sm font-bold">
          Verification Tips:
        </h3>

        {VERIFICATION_TIPS.map((tip, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
              <Check className="text-primary h-3 w-3" />
            </div>
            <p className="text-muted-foreground text-sm">{tip}</p>
          </div>
        ))}
      </div>

      {/* Wrong Email Link */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground text-sm">
          Wrong email address?
          <button className="text-primary hover:text-secondary ml-1 font-bold transition-colors duration-200">
            Change Email
          </button>
        </p>
      </div>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Security Notice */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
          <div>
            <p className="mb-1 text-sm font-semibold text-yellow-900">
              Security Notice
            </p>
            <p className="text-xs text-yellow-800">
              Never share your verification code with anyone. Gaza Tech Market
              will never ask for your code via phone or email.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
