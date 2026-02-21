export type VerificationFormClientProps = {
    /**
     * True when auth user has both user.phone AND user.phone_confirmed_at.
     * If true the entire Phone Verification section is hidden.
     */
    isPhoneVerified: boolean;
    /** The confirmed phone number from auth, used to pre-fill the input. */
    existingPhone: string | null;
}

export type useVerificationFormClient = VerificationFormClientProps; 