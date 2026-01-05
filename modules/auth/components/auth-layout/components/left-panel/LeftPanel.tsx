'use client';

import { useTranslations } from 'next-intl';
import { Cpu, HelpCircle, Mail } from 'lucide-react';
import { FC } from 'react';
import { LeftPanelProps } from './types';
import { useLeftPanel } from './hooks/useLeftPanel';
import Image from 'next/image';

const LeftPanel: FC<LeftPanelProps> = ({ variant }) => {
  const t = useTranslations('Auth.layout');
  const { description, features, heading } = useLeftPanel(variant);

  return (
    <div className="from-primary via-secondary to-left-panel-gradient-to relative hidden overflow-hidden bg-linear-to-br lg:flex lg:w-1/2">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute start-20 top-20 h-64 w-64 rounded-full bg-white blur-3xl" />
        <div className="absolute end-20 bottom-20 h-96 w-96 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full flex-col justify-between p-12">
        {/* Brand Section */}
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg">
              <Cpu className="text-primary h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {t('brandName')}
              </h1>
              <p className="text-left-panel-text-muted text-sm">
                {t('brandTagline')}
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-8">
          {variant === 'verify-email' && (
            <div className="flex items-center justify-center py-8">
              <div className="flex h-64 w-64 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm">
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl">
                    <Mail className="text-primary h-12 w-12" />
                  </div>
                  <p className="text-left-panel-text-muted px-6 text-lg">
                    {t('verificationCodeSent')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-4 text-4xl leading-tight font-bold text-white">
              {heading}
            </h2>
            <p className="text-left-panel-text-muted text-lg">{description}</p>
          </div>

          <div className="space-y-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-left-panel-text-muted">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        {variant === 'login' ? (
          <div className="mt-5 grid grid-cols-3 gap-6">
            <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-1 text-3xl font-bold text-white">15K+</div>
              <div className="text-left-panel-text-muted text-sm">
                {t('stats.activeUsers')}
              </div>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-1 text-3xl font-bold text-white">8K+</div>
              <div className="text-left-panel-text-muted text-sm">
                {t('stats.productsListed')}
              </div>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-1 text-3xl font-bold text-white">99%</div>
              <div className="text-left-panel-text-muted text-sm">
                {t('stats.satisfaction')}
              </div>
            </div>
          </div>
        ) : variant === 'signup' ? (
          <div className="mt-5 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-start gap-4">
              <Image
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
                alt="User testimonial"
                width={56}
                height={56}
                className="rounded-full border-2 border-white shadow-lg"
              />
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="h-4 w-4 fill-current text-yellow-300"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mb-3 text-sm leading-relaxed text-white">
                  &quot;{t('testimonial.quote')}&quot;
                </p>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {t('testimonial.author')}
                  </p>
                  <p className="text-left-panel-text-muted text-xs">
                    {t('testimonial.role')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-white" />
                <span className="font-medium text-white">{t('needHelp')}</span>
              </div>
              <button className="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/30">
                {t('contactSupport')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
