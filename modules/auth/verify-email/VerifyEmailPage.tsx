import Link from "next/link";
import { ArrowLeft, Mail, Info, Check, AlertTriangle } from "lucide-react";
import AuthLayout from "@/modules/auth/components/auth-layout/AuthLayout";
import TrustBadges from "@/modules/auth/components/trust-badges/TrustBadges";
import { OtpForm } from "./components/otp-form";
import { VERIFICATION_TIPS } from "./verifyEmailPage.constant";
import { VerifyEmailPageProps } from "./types";
import { FC } from "react";

const VerifyEmailPage: FC<VerifyEmailPageProps> = ({ email }) => {
  return (
    <AuthLayout variant="verify-email">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/login"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-semibold">Back to Login</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-linear-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Mail className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
          Verify Your Email
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          We&apos;ve sent a 6-digit verification code to
        </p>
        <p className="text-primary font-bold text-lg mt-2">{email}</p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-8">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-blue-900 font-semibold mb-1">Check your inbox</p>
            <p className="text-blue-700 text-sm">
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
        <h3 className="font-bold text-foreground text-sm mb-3">
          Verification Tips:
        </h3>

        {VERIFICATION_TIPS.map((tip, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{tip}</p>
          </div>
        ))}
      </div>

      {/* Wrong Email Link */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground text-sm">
          Wrong email address?
          <button className="font-bold text-primary hover:text-secondary transition-colors duration-200 ml-1">
            Change Email
          </button>
        </p>
      </div>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Security Notice */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-yellow-900 font-semibold text-sm mb-1">
              Security Notice
            </p>
            <p className="text-yellow-800 text-xs">
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
