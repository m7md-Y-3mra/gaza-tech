'use client';

import TextField from '@/components/text-field/TextField';
import SelectField from '@/components/select-field/SelectField';
import CheckboxField from '@/components/checkbox-field/CheckboxField';
import UploadImage from '../../components/upload-image';
import OtpVerify from '../../components/otp-verify';
import {
  User,
  Calendar,
  IdCard,
  MapPin,
  ShieldCheck,
  Loader2,
  Send,
  Phone,
  MessageCircle,
} from 'lucide-react';
import Section from './components/section';
import InfoBanner from './components/info-banner';
import { VerificationFormClientProps } from './types';
import { getDocumentTypeOptions, getGenderOptions } from './constant';
import { useVerificationForm } from './hooks/useVerificationForm';
import { FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';

const VerificationFormClient = ({
  isPhoneVerified,
  existingPhone,
}: VerificationFormClientProps) => {
  const t = useTranslations('VerificationForm');
  const {
    methods,
    handleSubmit,
    isSubmitting,
    livePhone,
    handleVerified,
    onSubmit,
  } = useVerificationForm({ isPhoneVerified, existingPhone });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* ── Step 1: Personal Information ── */}
        <Section
          icon={User}
          title={t('personalInfo.title')}
          subtitle={t('personalInfo.subtitle')}
        >
          <InfoBanner variant="blue">{t('personalInfo.banner')}</InfoBanner>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TextField
              name="id_full_name"
              label={t('personalInfo.fullNameLabel')}
              Icon={User}
              placeholder={t('personalInfo.fullNamePlaceholder')}
              required
            />
            <TextField
              name="id_date_of_birth"
              label={t('personalInfo.dateOfBirthLabel')}
              Icon={Calendar}
              type="date"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SelectField
              name="id_gender"
              label={t('personalInfo.genderLabel')}
              placeholder={t('personalInfo.genderPlaceholder')}
              options={getGenderOptions(t)}
            />
            <TextField
              name="national_id_number"
              label={t('personalInfo.nationalIdLabel')}
              Icon={IdCard}
              placeholder={t('personalInfo.nationalIdPlaceholder')}
              maxLength={9}
              required
            />
          </div>

          <TextField
            name="address"
            label={t('personalInfo.addressLabel')}
            Icon={MapPin}
            placeholder={t('personalInfo.addressPlaceholder')}
            required
          />
        </Section>

        {/* ── Step 2: Document Upload ── */}
        <Section
          icon={IdCard}
          title={t('documentUpload.title')}
          subtitle={t('documentUpload.subtitle')}
        >
          <InfoBanner variant="amber">{t('documentUpload.banner')}</InfoBanner>

          <SelectField
            name="document_type"
            label={t('documentUpload.documentTypeLabel')}
            placeholder={t('documentUpload.documentTypePlaceholder')}
            options={getDocumentTypeOptions(t)}
          />

          <UploadImage
            id="document_front"
            name="document_front"
            label={t('documentUpload.frontLabel')}
            description={t('documentUpload.frontDescription')}
            required
          />

          <UploadImage
            id="document_back"
            name="document_back"
            label={t('documentUpload.backLabel')}
            description={t('documentUpload.backDescription')}
            required
          />

          <UploadImage
            id="selfie_with_id"
            name="selfie_with_id"
            label={t('documentUpload.selfieLabel')}
            description={t('documentUpload.selfieDescription')}
            required
          />
        </Section>

        {/* ── Step 3: Phone Verification ── */}
        {isPhoneVerified ? (
          // ── Already verified — show a read-only badge ──────────────────
          <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="from-primary to-secondary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br shadow-md">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-foreground text-xl font-bold">
                  {t('phoneVerification.title')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('phoneVerification.alreadyVerifiedSubtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-900 dark:text-green-100">
                  {t('phoneVerification.verifiedLabel')}
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {t('phoneVerification.verifiedDescription', {
                    phone: existingPhone ?? '',
                  })}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // ── Needs verification — show full OTP flow ────────────────────
          <Section
            icon={ShieldCheck}
            title={t('phoneVerification.title')}
            subtitle={t('phoneVerification.subtitle')}
          >
            <InfoBanner variant="green">
              <strong>{t('phoneVerification.bannerStrong')}</strong>{' '}
              {t('phoneVerification.banner')}
            </InfoBanner>

            {/* Phone number inputs */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TextField
                name="phone_number"
                label={t('phoneVerification.phoneNumberLabel')}
                Icon={Phone}
                placeholder={t('phoneVerification.phoneNumberPlaceholder')}
                type="tel"
                required
              />
              <TextField
                name="whatsapp_number"
                label={t('phoneVerification.whatsAppLabel')}
                Icon={MessageCircle}
                placeholder={t('phoneVerification.whatsAppPlaceholder')}
                type="tel"
              />
            </div>

            <p className="text-muted-foreground text-xs">
              {t('phoneVerification.hint')}
            </p>

            <OtpVerify
              name="phone_verified"
              phone={livePhone}
              initialVerified={false}
              onVerified={handleVerified}
            />
          </Section>
        )}

        {/* ── Terms ── */}
        <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
          <CheckboxField name="terms_accepted">{t('terms.text')}</CheckboxField>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="from-primary to-secondary w-full rounded-xl bg-linear-to-r px-8 py-4 text-base font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('buttons.submitting')}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Send className="h-5 w-5" />
              {t('buttons.submit')}
            </span>
          )}
        </button>
      </form>
    </FormProvider>
  );
};

export default VerificationFormClient;
