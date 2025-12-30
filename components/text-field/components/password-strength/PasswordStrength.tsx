"use client";
import { FC } from "react";
import { Circle, CheckCircle2 } from "lucide-react";
import { PasswordStrengthProps } from "./types";
import { usePasswordStrength } from "./hooks/usePasswordStrength";

const PasswordStrength: FC<PasswordStrengthProps> = ({ password }) => {
  const { strength, strengthLabel, strengthColor, requirements } =
    usePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      {/* Strength Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              strengthColor.split(" ")[0]
            }`}
            style={{ width: `${strength}%` }}
          />
        </div>
        {strengthLabel && (
          <span
            className={`text-xs font-semibold ${strengthColor.split(" ")[1]}`}
          >
            {strengthLabel}
          </span>
        )}
      </div>

      {/* Requirements List */}
      <div className="mt-3 space-y-1.5">
        {requirements.map((req) => (
          <div
            key={req.id}
            className={`flex items-center space-x-2 text-sm transition-colors ${
              req.met ? "text-green-600" : "text-muted-foreground"
            }`}
          >
            {req.met ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Circle className="w-3.5 h-3.5" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;
