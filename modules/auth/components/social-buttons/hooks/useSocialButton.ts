import { SocialButtonsVariant } from "../types";

export const useSocialButtons = (mode: SocialButtonsVariant) => {

    const actionText = mode === "login" ? "Continue with" : "Sign up with";
    return {
        actionText
    }
}