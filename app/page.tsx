import AuthLayout from "@/modules/auth/components/auth-layout";
import SocialButtons from "@/modules/auth/components/social-buttons";
import TrustBadges from "@/modules/auth/components/trust-badges";
import SignupForm from "./(auth)/signup/components/signup-form";

export default function Home() {
  return (
    // <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
    <AuthLayout variant="login">
      <SocialButtons mode="login" />
      <SignupForm />
    </AuthLayout>
    // </div>
  );
}
