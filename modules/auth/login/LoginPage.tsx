import Link from 'next/link';
import AuthLayout from '../components/auth-layout';
import SocialButtons from '../components/social-buttons';
import LoginForm from './components/LoginForm';
import TrustBadges from '../components/trust-badges';

const LoginPage = () => {
  return (
    <AuthLayout variant="login">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-foreground mb-3 text-3xl font-bold lg:text-4xl">
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
      <div className="mb-8 flex items-center">
        <div className="border-border flex-1 border-t-2" />
        <span className="text-muted-foreground px-4 font-medium">OR</span>
        <div className="border-border flex-1 border-t-2" />
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Sign Up Link */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-primary hover:text-secondary ml-1 font-bold transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>

      {/* Language Selector */}
      <div className="mt-8 flex items-center justify-center space-x-3">
        <button className="bg-muted hover:bg-muted/80 flex items-center space-x-2 rounded-lg px-4 py-2 transition-colors">
          <svg
            className="text-muted-foreground h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-muted-foreground text-sm font-medium">
            English
          </span>
          <svg
            className="text-muted-foreground h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <button className="bg-background border-border hover:bg-muted/50 flex items-center space-x-2 rounded-lg border px-4 py-2 transition-colors">
          <span className="text-muted-foreground text-sm font-medium">
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
