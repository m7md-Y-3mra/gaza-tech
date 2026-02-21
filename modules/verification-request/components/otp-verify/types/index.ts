export type OtpVerifyProps = {
    /** react-hook-form field name — will be set to `true` once phone is verified */
    name: string;
    /** The phone number to send the OTP to (e.g. "+97059XXXXXXX") */
    phone: string;
    /** Pass `true` if the user already has a verified phone (skip OTP flow) */
    initialVerified?: boolean;
    /**
     * Called after Supabase OTP is successfully verified.
     * Use this to update the users table with the phone/whatsapp numbers.
     */
    onVerified?: () => Promise<void>;
};

export type UseOtpVerifyProps = {
    name: string;
    phone: string;
    initialVerified?: boolean;
    onVerified?: () => Promise<void>;
};

export type OtpStep = 'idle' | 'sent' | 'verified';
