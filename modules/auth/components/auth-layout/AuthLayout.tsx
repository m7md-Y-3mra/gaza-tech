import { Cpu } from 'lucide-react';
import { AuthLayoutProps } from './types';
import { FC } from 'react';
import LeftPanel from './components/left-panel';

const AuthLayout: FC<AuthLayoutProps> = ({ children, variant }) => {
  return (
    <div className="flex min-h-screen">
      <LeftPanel variant={variant} />

      <div className="flex w-full items-center justify-center bg-linear-to-br from-gray-50 via-white to-green-50 p-6 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Brand */}
          <div className="mb-8 flex items-center justify-center lg:hidden">
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
