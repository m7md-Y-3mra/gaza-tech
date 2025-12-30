import Link from 'next/link';
import { Shield } from 'lucide-react';
import AuthLayout from '../components/auth-layout';
import SocialButtons from '../components/social-buttons';
import SignupForm from './components/signup-form';
import TrustBadges from '../components/trust-badges';

const SignupPage = () => {
  return (
    <AuthLayout variant="signup">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-foreground mb-3 text-3xl font-bold lg:text-4xl">
          Create Your Account
        </h2>
        <p className="text-muted-foreground text-lg">
          Join Gaza Tech Market in just a few steps
        </p>
      </div>

      {/* Social Signup */}
      <div className="mb-8">
        <SocialButtons mode="signup" />
      </div>

      {/* Divider */}
      <div className="mb-8 flex items-center">
        <div className="border-border flex-1 border-t-2" />
        <span className="text-muted-foreground px-4 font-medium">OR</span>
        <div className="border-border flex-1 border-t-2" />
      </div>

      {/* Signup Form */}
      <SignupForm />

      {/* Login Link */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary hover:text-secondary ml-1 font-bold transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>

      {/* Security Info */}
      <div className="bg-primary/10 border-primary/20 mt-8 rounded-xl border p-4">
        <div className="flex items-start space-x-3">
          <Shield className="text-primary mt-0.5 h-5 w-5" />
          <div>
            <h4 className="text-foreground mb-1 text-sm font-semibold">
              Your Data is Secure
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We use industry-standard encryption to protect your personal
              information. Your data will never be shared with third parties
              without your consent.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <TrustBadges />
    </AuthLayout>
  );
};

export default SignupPage;
