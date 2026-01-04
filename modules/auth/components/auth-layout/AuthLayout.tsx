import { Cpu } from 'lucide-react';
import { AuthLayoutProps } from './types';
import { FC } from 'react';
import LeftPanel from './components/left-panel';

const AuthLayout: FC<AuthLayoutProps> = ({ children, variant }) => {
  return (
    <div className="flex min-h-screen">
      <LeftPanel variant={variant} />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 ">
        <div className="w-full max-w-md">
          {/* Mobile Brand */}
          <div className="mb-8 flex items-center justify-center lg:hidden bg-linear-to-br from-auth-gradient-from via-auth-gradient-via to-auth-gradient-to">
            <div className="from-primary to-secondary flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg">
              <Cpu className="h-6 w-6 text-white" />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
