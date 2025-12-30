import { Cpu } from "lucide-react";
import { AuthLayoutProps } from "./types";
import { FC } from "react";
import LeftPanel from "./components/left-panel";

const AuthLayout: FC<AuthLayoutProps> = ({ children, variant }) => {
  return (
    <div className="min-h-screen flex">
      <LeftPanel variant={variant} />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-linear-to-br from-gray-50 via-white to-green-50">
        <div className="w-full max-w-md">
          {/* Mobile Brand */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-14 h-14 bg-linear-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <Cpu className="w-6 h-6 text-white" />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
