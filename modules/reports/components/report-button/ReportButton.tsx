'use client';

import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ReportModal } from '../report-modal';
import { ContentType } from '../report-modal/types';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface ReportButtonProps {
  contentType: ContentType;
  contentId: string;
  contentOwnerId: string;
  variant?: 'ghost' | 'outline' | 'default' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

const ReportButton: React.FC<ReportButtonProps> = ({
  contentType,
  contentId,
  contentOwnerId,
  variant = 'ghost',
  size = 'icon',
  className = '',
  showText = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();
  const t = useTranslations('Report');

  // Don't show if it's the user's own content
  if (!isLoading && user?.id === contentOwnerId) {
    return null;
  }

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    setIsOpen(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={showText && size === 'icon' ? 'default' : size}
        className={cn(
          'text-muted-foreground hover:text-destructive group transition-colors duration-200 hover:bg-transparent',
          className
        )}
        onClick={handleOpen}
        title={t('title')}
      >
        <Flag
          className={cn(
            'transition-transform duration-200 group-hover:scale-110',
            showText ? 'me-2 size-4' : 'size-4'
          )}
        />
        {showText && <span>{t('title')}</span>}
      </Button>

      <ReportModal
        contentType={contentType}
        contentId={contentId}
        contentOwnerId={contentOwnerId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default ReportButton;
