'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import AuthLayout from '../components/auth-layout';
import SocialButtons from '../components/social-buttons';
import LoginForm from './components/LoginForm';
import TrustBadges from '../components/trust-badges';

const LoginPage = () => {
  const t = useTranslations('Auth');

  return (
    <AuthLayout variant="login">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-foreground mb-3 text-3xl font-bold lg:text-4xl">
          {t('login.title')}
        </h2>
        <p className="text-muted-foreground text-lg">{t('login.subtitle')}</p>
      </div>

      {/* Social Login */}
      <div className="mb-8">
        <SocialButtons mode="login" />
      </div>

      {/* Divider */}
      <div className="mb-8 flex items-center">
        <div className="border-border flex-1 border-t-2" />
        <span className="text-muted-foreground px-4 font-medium">
          {t('common.or')}
        </span>
        <div className="border-border flex-1 border-t-2" />
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Sign Up Link */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          {t('login.noAccount')}{' '}
          <Link
            href="/signup"
            className="text-primary hover:text-secondary ms-1 font-bold transition-colors"
          >
            {t('login.signUp')}
          </Link>
        </p>
      </div>

      {/* Trust Badges */}
      <TrustBadges />
    </AuthLayout>
  );
};

export default LoginPage;
