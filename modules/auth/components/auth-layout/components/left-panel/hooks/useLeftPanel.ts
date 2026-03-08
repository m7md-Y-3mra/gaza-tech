'use client';

import { useTranslations } from 'next-intl';
import {
  Bell,
  Clock,
  Gift,
  Headphones,
  Shield,
  Store,
  Users,
  Zap,
} from 'lucide-react';
import { LeftPanelVariant } from '../types';

export const useLeftPanel = (variant: LeftPanelVariant) => {
  const t = useTranslations('Auth.layout');

  const loginFeatures = [
    {
      icon: Shield,
      title: t('login.features.secureTransactions.title'),
      description: t('login.features.secureTransactions.description'),
    },
    {
      icon: Users,
      title: t('login.features.vibrantCommunity.title'),
      description: t('login.features.vibrantCommunity.description'),
    },
    {
      icon: Zap,
      title: t('login.features.fastListing.title'),
      description: t('login.features.fastListing.description'),
    },
  ];

  const signupFeatures = [
    {
      icon: Gift,
      title: t('signup.features.welcomeBonus.title'),
      description: t('signup.features.welcomeBonus.description'),
    },
    {
      icon: Bell,
      title: t('signup.features.instantNotifications.title'),
      description: t('signup.features.instantNotifications.description'),
    },
    {
      icon: Store,
      title: t('signup.features.freeStoreSetup.title'),
      description: t('signup.features.freeStoreSetup.description'),
    },
    {
      icon: Headphones,
      title: t('signup.features.support.title'),
      description: t('signup.features.support.description'),
    },
  ];

  const verifyEmailFeatures = [
    {
      icon: Shield,
      title: t('verifyEmail.features.enhancedSecurity.title'),
      description: t('verifyEmail.features.enhancedSecurity.description'),
    },
    {
      icon: Clock,
      title: t('verifyEmail.features.timeLimitedCode.title'),
      description: t('verifyEmail.features.timeLimitedCode.description'),
    },
  ];

  const features =
    variant === 'login'
      ? loginFeatures
      : variant === 'signup'
        ? signupFeatures
        : verifyEmailFeatures;

  const heading =
    variant === 'login'
      ? t('login.heading')
      : variant === 'signup'
        ? t('signup.heading')
        : t('verifyEmail.heading');

  const description =
    variant === 'login'
      ? t('login.description')
      : variant === 'signup'
        ? t('signup.description')
        : t('verifyEmail.description');

  return { features, heading, description };
};
