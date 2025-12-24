import Link from "next/link";
import AuthLayout from "../components/auth-layout";
import SocialButtons from "../components/social-buttons";
import LoginForm from "./components/LoginForm";
import TrustBadges from "../components/trust-badges";

const LoginPage = () => {
  return (
    <AuthLayout variant="login">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
          Welcome Back!
        </h2>
        <p className="text-muted-foreground text-lg">
          Sign in to continue to Gaza Tech Market
        </p>
      </div>

      {/* Social Login */}
      <div className="mb-8">
        <SocialButtons mode="login" />
      </div>

      {/* Divider */}
      <div className="flex items-center mb-8">
        <div className="flex-1 border-t-2 border-border" />
        <span className="px-4 text-muted-foreground font-medium">OR</span>
        <div className="flex-1 border-t-2 border-border" />
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Sign Up Link */}
      <div className="text-center mt-8">
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-primary hover:text-secondary transition-colors ml-1"
          >
            Sign Up
          </Link>
        </p>
      </div>

      {/* Language Selector */}
      <div className="mt-8 flex items-center justify-center space-x-3">
        <button className="flex items-center space-x-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
          <svg
            className="w-4 h-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-sm font-medium text-muted-foreground">
            English
          </span>
          <svg
            className="w-3 h-3 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 bg-background border border-border hover:bg-muted/50 rounded-lg transition-colors">
          <span className="text-sm font-medium text-muted-foreground">
            العربية
          </span>
        </button>
      </div>

      {/* Trust Badges */}
      <TrustBadges />
    </AuthLayout>
  );
};

export default LoginPage;
