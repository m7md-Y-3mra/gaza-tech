import { loginFeatures, signupFeatures, verifyEmailFeatures } from "../leftPanel.constant";
import { LeftPanelVariant } from "../types";

export const useLeftPanel = (variant: LeftPanelVariant) => {
  const features =
    variant === "login"
      ? loginFeatures
      : variant === "signup"
        ? signupFeatures
        : verifyEmailFeatures;

  const heading =
    variant === "login"
      ? "Connect, Buy & Sell Technology Products"
      : variant === "signup"
        ? "Start Your Tech Journey Today"
        : "Check Your Inbox";

  const description =
    variant === "login"
      ? "Join the leading tech marketplace in Gaza. Discover amazing deals, connect with tech enthusiasts, and grow your business."
      : variant === "signup"
        ? "Create your free account and unlock access to thousands of tech products, exclusive deals, and a thriving community of technology enthusiasts."
        : "We've sent a verification code to secure your account. Enter the code to complete your registration.";

  return { features, heading, description }
}