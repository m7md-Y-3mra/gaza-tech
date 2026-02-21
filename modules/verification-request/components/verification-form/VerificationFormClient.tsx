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
import { DOCUMENT_TYPE_OPTIONS, GENDER_OPTIONS } from './constant';
import { useVerificationForm } from './hooks/useVerificationForm';
import { FormProvider } from 'react-hook-form';

const VerificationFormClient = ({
  isPhoneVerified,
  existingPhone,
}: VerificationFormClientProps) => {
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
          title="Personal Information"
          subtitle="Please provide your accurate personal details"
        >
          <InfoBanner variant="blue">
            We verify all sellers to ensure a safe marketplace. Your information
            is encrypted and secure.
          </InfoBanner>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TextField
              name="id_full_name"
              label="Full Name"
              Icon={User}
              placeholder="As it appears on your ID"
              required
            />
            <TextField
              name="id_date_of_birth"
              label="Date of Birth"
              Icon={Calendar}
              type="date"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SelectField
              name="id_gender"
              label="Gender"
              placeholder="Select gender"
              options={GENDER_OPTIONS}
            />
            <TextField
              name="national_id_number"
              label="National ID Number"
              Icon={IdCard}
              placeholder="Enter your 9-digit ID number"
              maxLength={9}
              required
            />
          </div>

          <TextField
            name="address"
            label="Street Address"
            Icon={MapPin}
            placeholder="Enter your full address"
            required
          />
        </Section>

        {/* ── Step 2: Document Upload ── */}
        <Section
          icon={IdCard}
          title="Document Upload"
          subtitle="Upload clear photos of your identification documents"
        >
          <InfoBanner variant="amber">
            Ensure all text is clearly visible. Accepted formats: JPG, PNG (max
            2MB each). Your face and ID must be clearly visible in the selfie.
          </InfoBanner>

          <SelectField
            name="document_type"
            label="Document Type"
            placeholder="Select document type"
            options={DOCUMENT_TYPE_OPTIONS}
          />

          <UploadImage
            id="document_front"
            name="document_front"
            label="ID Card — Front Side"
            description="Upload a clear photo of the front side of your ID"
            required
          />

          <UploadImage
            id="document_back"
            name="document_back"
            label="ID Card — Back Side"
            description="Upload a clear photo of the back side of your ID"
            required
          />

          <UploadImage
            id="selfie_with_id"
            name="selfie_with_id"
            label="Selfie with ID Card"
            description="Hold your ID next to your face — both must be clearly visible"
            required
          />
        </Section>

        {/* ── Step 3: Phone Verification ── */}
        {isPhoneVerified ? (
          // ── Already verified — show a read-only badge ──────────────────
          <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="from-primary to-secondary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-foreground text-xl font-bold">
                  Phone Verification
                </h3>
                <p className="text-muted-foreground text-sm">
                  Already verified
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-900 dark:text-green-100">
                  Phone Verified
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {existingPhone} — confirmed via OTP
                </p>
              </div>
            </div>
          </div>
        ) : (
          // ── Needs verification — show full OTP flow ────────────────────
          <Section
            icon={ShieldCheck}
            title="Phone Verification"
            subtitle="Verify your phone number to complete seller verification"
          >
            <InfoBanner variant="green">
              <strong>Final Step!</strong> Enter your phone number below. A
              one-time code will be sent via SMS. Once verified, your number is
              saved to your profile.
            </InfoBanner>

            {/* Phone number inputs */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TextField
                name="phone_number"
                label="Phone Number"
                Icon={Phone}
                placeholder="+970 59 XXX XXXX"
                type="tel"
                required
              />
              <TextField
                name="whatsapp_number"
                label="WhatsApp Number"
                Icon={MessageCircle}
                placeholder="+970 59 XXX XXXX (optional)"
                type="tel"
              />
            </div>

            <p className="text-muted-foreground text-xs">
              Use international format starting with your country code (e.g.{' '}
              <span className="font-semibold">+970</span> for Palestine).
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
          <CheckboxField name="terms_accepted">
            I confirm that all information and documents provided are accurate
            and authentic. I understand that providing false information may
            result in permanent account suspension.
          </CheckboxField>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="from-primary to-secondary w-full rounded-xl bg-gradient-to-r px-8 py-4 text-base font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Send className="h-5 w-5" />
              Submit Verification Request
            </span>
          )}
        </button>
      </form>
    </FormProvider>
  );
};

export default VerificationFormClient;
