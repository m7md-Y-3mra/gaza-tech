import Link from "next/link";
import { Shield } from "lucide-react";
import AuthLayout from "../components/auth-layout";
import SocialButtons from "../components/social-buttons";
import SignupForm from "./components/signup-form";
import TrustBadges from "../components/trust-badges";

const SignupPage = () => {
  return (
    <AuthLayout variant="signup">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
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
      <div className="flex items-center mb-8">
        <div className="flex-1 border-t-2 border-border" />
        <span className="px-4 text-muted-foreground font-medium">OR</span>
        <div className="flex-1 border-t-2 border-border" />
      </div>

      {/* Signup Form */}
      <SignupForm />

      {/* Login Link */}
      <div className="text-center mt-8">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-primary hover:text-secondary transition-colors ml-1"
          >
            Sign In
          </Link>
        </p>
      </div>

      {/* Security Info */}
      <div className="mt-8 bg-primary/10 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-1">
              Your Data is Secure
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
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
