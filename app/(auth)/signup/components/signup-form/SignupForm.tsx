"use client";
import { AlertCircle, Mail, User, Lock } from "lucide-react";
import { useSignupForm } from "./hooks/useSignupForm";
import { Button } from "@/components/ui/button";
import { Form, FormikProvider } from "formik";
import TextField from "@/components/text-field";
import CheckboxField from "@/components/checkbox-field";

const SignupForm = () => {
  const { formik, isSubmitting, serverError, passwordsMatch } = useSignupForm();

  return (
    <FormikProvider value={formik}>
      <Form className="space-y-5">
        {serverError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{serverError}</p>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="First Name"
            name="firstName"
            placeholder="Enter your first name"
            Icon={User}
          />

          <TextField
            label="Last Name"
            name="lastName"
            placeholder="Enter your last name"
            Icon={User}
          />
        </div>

        {/* Email Field */}
        <TextField
          label="Email Address"
          name="email"
          placeholder="Enter your email"
          Icon={Mail}
          type="email"
        />

        {/* Password Field */}
        <TextField
          label="Password"
          name="password"
          type="password"
          placeholder="Create a strong password"
          Icon={Lock}
          showStrength
        />

        {/* Confirm Password Field */}
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          Icon={Lock}
          isSuccess={passwordsMatch}
          successMessage="Passwords match"
        />

        {/* Terms Checkbox */}
        <CheckboxField name="terms">
          I agree to the{" "}
          <a
            href="#"
            className="font-semibold text-primary hover:text-secondary transition-colors"
          >
            Terms & Conditions
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="font-semibold text-primary hover:text-secondary transition-colors"
          >
            Privacy Policy
          </a>
        </CheckboxField>

        {/* Newsletter Checkbox */}
        <CheckboxField name="newsletter">
          Send me exclusive deals, product updates, and tech news via email
        </CheckboxField>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-linear-to-r from-primary to-secondary text-white font-bold text-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </Button>
      </Form>
    </FormikProvider>
  );
};

export default SignupForm;
