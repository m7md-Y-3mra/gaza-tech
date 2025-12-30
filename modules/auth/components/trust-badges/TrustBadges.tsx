import { Shield, UserCheck, Lock } from "lucide-react";

const TrustBadges = () => {
  return (
    <div className="mt-10 pt-8 border-t border-border">
      <div className="flex items-center justify-center space-x-8">
        <div className="text-center">
          <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground font-medium">
            Secure Login
          </p>
        </div>
        <div className="text-center">
          <Lock className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground font-medium">
            256-bit SSL
          </p>
        </div>
        <div className="text-center">
          <UserCheck className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground font-medium">
            Privacy Protected
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
