import { Button } from '@/components/ui/button';
import { FC } from 'react';
import { SocialButtonProps } from './types';

const SocialButton: FC<SocialButtonProps> = ({ label, children }) => {
  return (
    <Button
      type="button"
      variant="outline"
      className="hover:border-primary hover:bg-muted/50 h-12 w-full border-2 transition-all duration-200"
    >
      {children}
      <span className="font-semibold">{label}</span>
    </Button>
  );
};

export default SocialButton;
