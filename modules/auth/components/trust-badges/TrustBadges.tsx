import { Shield, UserCheck, Lock } from 'lucide-react';

const TrustBadges = () => {
  return (
    <div className="border-border mt-10 border-t pt-8">
      <div className="flex items-center justify-center space-x-8">
        <div className="text-center">
          <Shield className="text-primary mx-auto mb-2 h-6 w-6" />
          <p className="text-muted-foreground text-xs font-medium">
            Secure Login
          </p>
        </div>
        <div className="text-center">
          <Lock className="text-primary mx-auto mb-2 h-6 w-6" />
          <p className="text-muted-foreground text-xs font-medium">
            256-bit SSL
          </p>
        </div>
        <div className="text-center">
          <UserCheck className="text-primary mx-auto mb-2 h-6 w-6" />
          <p className="text-muted-foreground text-xs font-medium">
            Privacy Protected
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
